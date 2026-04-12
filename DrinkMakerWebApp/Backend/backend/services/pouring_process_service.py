from __future__ import annotations
import asyncio
from typing import Optional, Callable, Dict, Any

# --- Sdílené stavy a util funkce z tvého projektu ---
#from api.pouring_api import notify
from core.all_states import system_state, input_state, glasses_state, bottles_state
import services.glasses_service as glasses_service

from services.uart_service import send_json, send_json_and_wait

# --- API pro logování / notifikace (volitelné) ---
NotifyFn = Callable[[str, Dict[str, Any]], None]


class PourError(RuntimeError):
    def __init__(self, stage: str, message: str, snapshot: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.stage = stage
        self.snapshot = snapshot or {}


class PouringProcessService:
    def __init__(self):
        self._lock = asyncio.Lock()
        self._task: Optional[asyncio.Task] = None

        # V sekundách
        self.timeout_check = 30.0
        self.timeout_pour = 600.0
        self.timeout_pickup = 120.0
        self.timeout_pour_start = 30.0

        self.poll_dt = 0.05

        self.current_stage = "IDLE"
        self.last_message = ""
        self.last_error = ""
        self.result_ok: Optional[bool] = None
        self.result_kind = "idle"   # idle | success | partial | failed | cancelled
        self.result_text = ""

        self.expected_positions: list[int] = []
        self.done_positions: list[int] = []
        self.failed_positions: list[int] = []
        self.failed_details: dict[int, str] = {}

    def _update_status(self, stage: str, data: Dict[str, Any]):
        self.current_stage = stage
        self.last_message = data.get("msg", "")
        if "error" in data and data["error"]:
            self.last_error = str(data["error"])
        print(f"[{stage}] {self.last_message}")

    def _reset_runtime_status(self):
        self.current_stage = "IDLE"
        self.last_message = ""
        self.last_error = ""
        self.result_ok = None
        self.result_kind = "idle"
        self.result_text = ""
        self.expected_positions = []
        self.done_positions = []
        self.failed_positions = []
        self.failed_details = {}

    def _reset_pouring_runtime_flags(self) -> None:
        input_state.pouring_done = False
        input_state.process_pouring_started = False

    def _reset_pouring_outcome_flags(self) -> None:
        if isinstance(getattr(input_state, "glass_done", None), list):
            input_state.glass_done = [False] * len(input_state.glass_done)

        if isinstance(getattr(input_state, "glass_failed", None), list):
            input_state.glass_failed = [False] * len(input_state.glass_failed)

    def _reset_result_state_to_cancelled(self) -> None:
        self.result_ok = False
        self.result_kind = "cancelled"
        self.result_text = "Proces byl zrušen uživatelem."
        self.last_error = "Proces byl zrušen uživatelem."

    async def _clear_check_mode_on_fatal(self, stage: str, fatal: str) -> None:
        try:
            self._reset_pouring_runtime_flags()

            if stage in {"check", "pour_start", "pour"}:
                payload = system_state.set_state(stop=True)
                await send_json_and_wait(payload)
                print(f"[POURING FATAL] Přepínám zařízení do STOP kvůli chybě: {fatal}")

            input_state.reset_mode()

        except Exception as e:
            print(f"[POURING FATAL WARN] Nepodařilo se ukončit CHECK mód: {e}")
    
    def _build_failure_reason_for_position(self, pos: int) -> str:
        empty_bottle = getattr(input_state, "empty_bottle", None)
        hx711_error = getattr(input_state, "HX711_error", None) or getattr(input_state, "hx711_error", None)

        if isinstance(empty_bottle, list) and pos < len(empty_bottle) and empty_bottle[pos]:
            return f"Během nalévání došla kapalina na stanovišti {pos + 1}."

        if isinstance(hx711_error, list) and pos < len(hx711_error) and hx711_error[pos]:
            return f"Chyba váhového senzoru na stanovišti {pos + 1}."

        # Problém se skleničkou — nezobrazujeme důvod
        return ""

    def _evaluate_result(self) -> Dict[str, Any]:
        expected = self._expected_glass_positions()

        if not expected:
            return {
                "kind": "failed",
                "ok": False,
                "msg": "Nebyla nalezena žádná objednaná sklenice.",
                "expected": [],
                "done_positions": [],
                "failed_positions": [],
                "failed_details": {},
            }

        done_positions: list[int] = []
        failed_positions: list[int] = []
        conflicted_positions: list[int] = []
        failed_details: dict[int, str] = {}

        for i in expected:
            done_flag = bool(input_state.glass_done[i])
            fail_flag = bool(input_state.glass_failed[i])

            # done + failed => bereme jako fail
            if done_flag and fail_flag:
                conflicted_positions.append(i)
                failed_positions.append(i)
                failed_details[i] = self._build_failure_reason_for_position(i)

            elif fail_flag:
                failed_positions.append(i)
                failed_details[i] = self._build_failure_reason_for_position(i)

            elif done_flag:
                done_positions.append(i)

        empty_bottles = getattr(input_state, "empty_bottle", None)
        empty_bottle_positions = []
        if isinstance(empty_bottles, list):
            empty_bottle_positions = [i for i, v in enumerate(empty_bottles) if v]

        liquid_parts = [reason for reason in failed_details.values() if reason]

        if len(failed_positions) == 0 and len(done_positions) == len(expected):
            kind = "success"
            ok = True
            msg = "Všechny objednané sklenice byly úspěšně dokončeny."

        elif len(done_positions) == 0 and len(failed_positions) == len(expected):
            kind = "failed"
            ok = False
            msg = "Proces nebyl úspěšně dokončen."
            if liquid_parts:
                msg += " " + " ".join(liquid_parts)

        elif len(done_positions) > 0 or len(failed_positions) > 0:
            kind = "partial"
            ok = False
            msg = "Proces byl dokončen částečně."
            if liquid_parts:
                msg += " " + " ".join(liquid_parts)

        else:
            kind = "failed"
            ok = False
            msg = "Proces nebyl úspěšně dokončen."

        return {
            "kind": kind,
            "ok": ok,
            "msg": msg,
            "expected": expected,
            "done_positions": done_positions,
            "failed_positions": failed_positions,
            "failed_details": failed_details,
        }
    # --------- Guard / background ----------

    def running(self) -> bool:
        return self._task is not None and not self._task.done()
    
    def cancel(self) -> None:
        if self._task and not self._task.done():
            self._task.cancel()

    def start_bg(self, notify: Optional[NotifyFn] = None) -> None:
        if self.running():
            raise PourError("guard", "Proces již běží.", self._snapshot())

        async def runner():
            try:
                await self.start(notify)
            finally:
                self._task = None

        self._task = asyncio.create_task(runner())

    # --------- Hlavní scénář ----------

    async def stop_and_cancel(self) -> None:
        # 1) zrušení běžící tasky
        self.cancel()

        # 2) reset runtime flagů
        self._reset_pouring_runtime_flags()
        self._reset_pouring_outcome_flags()

        # 3) nastavení výsledkového stavu
        self._reset_result_state_to_cancelled()
        self.current_stage = "POURING CANCELLED"
        self.last_message = "Proces byl zrušen uživatelem."

        # 4) poslání STOP do zařízení
        try:
            payload = system_state.set_state(stop=True)
            await send_json_and_wait(payload)
        except Exception as e:
            print(f"[POURING CANCEL WARN] STOP do zařízení se nepodařilo odeslat: {e}")


    async def start(self, notify: Optional[NotifyFn] = None) -> Dict[str, Any]:
        """
        Jednoduchý scénář:
          1) SYNC sklenic do HW (GlassesState) a odeslat
          2) CHECK: zapnout kontrolu a počkat na potvrzení
          3) POUR: poslat start + výšku nalévání a počkat na dokončení
          4) PICKUP: počkat, až obsluha vyzvedne sklenice
        """
        def internal_notify(stage, data):
            self._update_status(stage, data)
            if notify: notify(stage, data)

        self._reset_runtime_status()
        self._reset_pouring_runtime_flags()
        self._reset_pouring_outcome_flags()

        try:
            async with self._lock:
                internal_notify("POURING INIT", {"msg": "Zahajuji proces nalévání."})

                # 1) SYNC -> odeslat seznam lahve/sklenice na ESP
                await self._sync_bottles_and_send(internal_notify)
                await self._sync_glasses_and_send(internal_notify)

                # 2) CHECK -> požádat ESP o kontrolu (senzory, bezpečnost)
                await self._send_check(True, internal_notify)
                await self._wait_for_check_ok("check", self.timeout_check, internal_notify)

                # 3) POUR -> start
                await self._send_start_pouring(internal_notify)
                await self._wait_for_pouring_started("pour_start", self.timeout_pour_start, internal_notify)
                await self._wait_for_pouring_done("pour", self.timeout_pour, internal_notify)

                # --- VYHODNOCENÍ CHYB A DEAKTIVACE LAHVÍ ---
                expected = self._expected_glass_positions()
                failed_glasses = [i for i in expected if input_state.glass_failed[i]]
                
                if failed_glasses:
                    internal_notify("POURING WARNING", {
                        "msg": f"Pozor: Drinky na pozicích {[i + 1 for i in failed_glasses]} selhaly."
                    })

                # Zakážeme všechny lahve, které jsou prázdné (empty_bottle je indexováno pozicí lahve,
                # nikoli startovní pozicí skleničky, proto nelze použít failed_glasses jako index)
                empty_bottles = getattr(input_state, "empty_bottle", [])
                for pos, is_empty in enumerate(empty_bottles):
                    if is_empty:
                        bottles_state.disable_position(pos, is_empty=True)
                        internal_notify("BOTTLE DISABLED", {"pos": pos, "msg": f"Lahev {pos + 1} došla."})
                # -------------------------------------------

                # 4) PICKUP -> počkat na dokončení procesu (done/failed flags)
                await self._wait_for_pickup("pickup", self.timeout_pickup, internal_notify)

                evaluation = self._evaluate_result()

                self.expected_positions = list(evaluation["expected"])
                self.done_positions = list(evaluation["done_positions"])
                self.failed_positions = list(evaluation["failed_positions"])
                self.failed_details = {int(k): v for k, v in evaluation["failed_details"].items()}

                self.result_ok = evaluation["ok"]
                self.result_kind = evaluation["kind"]
                self.result_text = evaluation["msg"]

                result = {
                    "ok": evaluation["ok"],
                    "stage": "done",
                    "result_kind": evaluation["kind"],
                    "result_text": evaluation["msg"],
                    "done_positions": evaluation["done_positions"],
                    "failed_positions": evaluation["failed_positions"],
                    "failed_details": evaluation["failed_details"],
                    "expected_positions": evaluation["expected"],
                    "snapshot": self._snapshot(),
                }

                if evaluation["kind"] == "success":
                    internal_notify("POURING DONE", {
                        "msg": evaluation["msg"],
                        **result
                    })
                elif evaluation["kind"] == "partial":
                    internal_notify("POURING PARTIAL", {
                        "msg": evaluation["msg"],
                        **result
                    })
                else:
                    internal_notify("POURING FAILED", {
                        "msg": evaluation["msg"],
                        "error": evaluation["msg"],
                        **result  
                    })

                glasses_service.clear_glasses()
                return result
            
        except asyncio.CancelledError:
            self._reset_pouring_runtime_flags()
            self._reset_pouring_outcome_flags()

            self.result_ok = False
            self.last_error = "Proces byl zrušen uživatelem."
            self.result_kind = "cancelled"
            self.result_text = "Proces byl zrušen uživatelem."
            self.current_stage = "POURING CANCELLED"
            self.last_message = "Proces byl zrušen uživatelem."

            internal_notify("POURING CANCELLED", {
                "msg": "Proces byl zrušen uživatelem.",
                "error": self.last_error,
            })
            raise

        except PourError as e:
            self.result_ok = False
            self.last_error = str(e)
            self.result_kind = "failed"
            self.result_text = str(e)
            internal_notify("POURING FAILED", {
                "msg": str(e),
                "error": str(e),
                "stage": e.stage,
            })
            return {
                "ok": False,
                "stage": e.stage,
                "error": str(e),
                "snapshot": e.snapshot,
            }

        except Exception as e:
            self.result_ok = False
            self.last_error = f"Neočekávaná chyba: {e}"
            self.result_kind = "failed"
            self.result_text = self.last_error
            internal_notify("POURING FAILED", {
                "msg": self.last_error,
                "error": self.last_error,
                "stage": "unexpected",
            })
            return {
                "ok": False,
                "stage": "unexpected",
                "error": self.last_error,
                "snapshot": self._snapshot(),
            }

        finally:
            pass
    

    # --------- Kroky – čisté a krátké ----------
    async def _sync_glasses_and_send(self, notify: NotifyFn) -> None:
        payload = glasses_service.set_from_temp_to_JSON_compact()
        print(f"[POURING SYNC GLASSES] payload={payload}")
        if payload:
            try:
                await send_json_and_wait(payload)
            except Exception as e:
                raise PourError("sync_glasses", f"Odeslání sklenic selhalo: {e}", self._snapshot())
            
        notify("POURING UART", {"msg": "Odeslán seznam sklenic do ESP.", "slots": list(glasses_state.get_glasses_in_list())})

    async def _sync_bottles_and_send(self, notify: NotifyFn) -> None:
        payload = bottles_state.to_position_json()
        if payload:
            try:
                await send_json_and_wait(payload)
            except Exception as e:
                raise PourError("sync_bottles", f"Odeslání lahví selhalo: {e}", self._snapshot())
            
        notify("POURING UART", {"msg": "Odeslány lahve do ESP.", "slots": list(bottles_state.get_bottle_assignments())})


    async def _send_check(self, enabled: bool, notify: NotifyFn) -> None:
        payload = system_state.set_state(check=enabled)
        try:
            await send_json_and_wait(payload)
        except Exception as e:
            raise PourError("send_check", f"Odeslání check selhalo: {e}", self._snapshot())
        
        notify("POURING UART", {"msg": f"CHECK => {enabled}"})


    async def _send_start_pouring(self, notify: NotifyFn) -> None:
        input_state.pouring_done = False
        input_state.process_pouring_started = False

        payload = system_state.set_state(start=True)
        try:
            await send_json_and_wait(payload)
        except Exception as e:
            raise PourError("pour_start_send", f"Odeslání START selhalo: {e}", self._snapshot())

        notify("POURING UART", {"msg": "START POURING"})


    # --------- Čekací podmínky ----------
    async def _wait_for_check_ok(self, stage: str, timeout: float, notify: NotifyFn) -> None:
        notify("POURING WAIT CHECK", {"stage": "check", "msg": "Čekám na dokončení CHECK..."})
        await self._wait_until(self._check_ok_condition, timeout, stage)

    async def _wait_for_pouring_done(self, stage: str, timeout: float, notify: NotifyFn) -> None:
        notify("POURING WAIT POURING", {"stage": "pour", "msg": "Čekám na dokončení nalévání..."})
        await self._wait_until(lambda: bool(input_state.pouring_done), timeout, stage)

    async def _wait_for_pickup(self, stage: str, timeout: float, notify: NotifyFn) -> None:
        notify("POURING WAIT PICKUP", {"stage": "pickup", "msg": "Čekám na dokončení všech objednaných sklenic (done/failed)..."})

        def pickup_cond() -> bool:
            # Kontrolujeme pouze to, zda proces pro očekávané sklenice skončil.
            # Fyzickou přítomnost sklenic (position_check) ignorujeme.
            expected = self._expected_glass_positions()
            
            if expected and isinstance(input_state.glass_done, list) and isinstance(input_state.glass_failed, list):
                # Každá očekávaná sklenice musí mít buď done=True nebo failed=True
                if all(input_state.glass_done[i] or input_state.glass_failed[i] for i in expected):
                    return True
            return False

        await self._wait_until(pickup_cond, timeout, stage)

    async def _wait_for_pouring_started(self, stage: str, timeout: float, notify: NotifyFn) -> None:
        notify("POURING WAIT POURING STARTED", {"stage": "pour_start", "msg": "Čekám na potvrzení, že nalévání začalo..."})
        await self._wait_until(lambda: bool(getattr(input_state, "process_pouring_started", False)), timeout, stage)

    # --------- Defenzivní kontroly + společná wait smyčka ----------

    def _have_fatal_error(self) -> Optional[str]:
        if getattr(input_state, "emergency_stop", False):
            return "EMERGENCY STOP"
        if getattr(input_state, "cannot_process_position", False):
            return "CANNOT PROCESS POSITION"
        if getattr(input_state, "cannot_process_glass", False):
            return "CANNOT PROCESS GLASS"
        if getattr(input_state, "cannot_set_mode", False):
            return "CANNOT SET MODE"
        return None


    def _have_nonfatal_comm_issue(self) -> bool:
        return bool(getattr(input_state, "mess_error", False))
    
    def _expected_glass_positions(self) -> list[int]:
        slots = list(glasses_service.get_glasses() or [])
        out: list[int] = []

        for i, g in enumerate(slots):
            if i < 0 or i >= 6:
                continue
            if g is None:
                continue

            vols = getattr(g, "volumes", None)
            if isinstance(vols, list) and any((v or 0) > 0 for v in vols):
                out.append(i)
            elif vols is None:
                out.append(i)

        return out

    def _check_ok_condition(self) -> bool:
        """
        CHECK je OK, když:
          - existuje aspoň jedna očekávaná pozice se sklenicí
          - na všech očekávaných pozicích input_state.position_check[i] == True
          - a nejsou hlášeny chyby (_have_errors() == None)
        """
        expected = self._expected_glass_positions()
        if not expected:
            return False

        pc = getattr(input_state, "position_check", None)

        print(f"[CHECK DBG] expected={expected} position_check={pc}")

        if not (isinstance(pc, list) and len(pc) >= 6):
            return False

        if all(bool(pc[i]) for i in expected):
            return self._have_fatal_error() is None

        return False

    async def _wait_until(self, predicate, timeout: float, stage: str) -> None:
        loop = asyncio.get_running_loop()
        deadline = loop.time() + timeout
        comm_warn_logged = False

        while True:
            fatal = self._have_fatal_error()
            if fatal:
                await self._clear_check_mode_on_fatal(stage, fatal)
                raise PourError(stage, f"Chyba z ESP: {fatal}", self._snapshot())

            if self._have_nonfatal_comm_issue():
                if not comm_warn_logged:
                    print(f"[POURING WARN] mess_error=True ve fázi '{stage}' - pokračuji dál.")
                    comm_warn_logged = True
            else:
                comm_warn_logged = False

            try:
                if predicate():
                    return
            except Exception as e:
                raise PourError(stage, f"Chyba evaluace podmínky: {e!r}", self._snapshot())

            if loop.time() > deadline:
                raise PourError(stage, f"Timeout {timeout:.0f}s ve fázi '{stage}'.", self._snapshot())

            await asyncio.sleep(self.poll_dt)
    # --------- Snapshots pro log/debug ----------

    def _snapshot(self) -> Dict[str, Any]:
        return {
            "input": {
                "position_check": getattr(input_state, "position_check", None),
                "glass_done": getattr(input_state, "glass_done", None),
                "glass_failed": getattr(input_state, "glass_failed", None),
                "empty_bottle": getattr(input_state, "empty_bottle", None),
                "HX711_error": getattr(input_state, "HX711_error", None) or getattr(input_state, "hx711_error", None),
                "pouring_done": getattr(input_state, "pouring_done", None),
                "mess_error": getattr(input_state, "mess_error", None),
                "cannot_process_position": getattr(input_state, "cannot_process_position", None),
                "cannot_process_glass": getattr(input_state, "cannot_process_glass", None),
                "cannot_set_mode": getattr(input_state, "cannot_set_mode", None),
                "emergency_stop": getattr(input_state, "emergency_stop", None),
                "mode": getattr(input_state, "current_mode", None),
                "process_pouring_started": getattr(input_state, "process_pouring_started", None)
            }
        }
