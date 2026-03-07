from __future__ import annotations
import asyncio
from typing import Optional, Callable, Dict, Any

# --- Sdílené stavy a util funkce z tvého projektu ---
#from api.pouring_api import notify
from core.all_states import system_state, input_state, glasses_state, bottles_state
import services.glasses_service as glasses_service

from services.uart_service import send_json

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

        # Nastavitelné timeouty (v sekundách) – uprav podle reálu:
        self.timeout_check = 30.0
        self.timeout_pour = 600.0
        self.timeout_pickup = 120.0
        self.timeout_pour_start = 30.0

        # Poll perioda, ať nezatěžujeme CPU/serial
        self.poll_dt = 0.05

        self.current_stage = "IDLE"
        self.last_message = ""

    def _update_status(self, stage: str, data: Dict[str, Any]):
        self.current_stage = stage
        self.last_message = data.get("msg", "")
        print(f"[{stage}] {self.last_message}")

    # --------- Guard / background ----------

    def running(self) -> bool:
        return self._task is not None and not self._task.done()

    def cancel(self) -> None:
        if self._task and not self._task.done():
            self._task.cancel()

    def start_bg(self, notify: Optional[NotifyFn] = None) -> None:
        if self.running():
            raise PourError("guard", "Proces již běží.", self._snapshot())
        self._task = asyncio.create_task(self.start(notify))

    # --------- Hlavní scénář ----------

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
                    "msg": f"Pozor: Drinky na pozicích {failed_glasses} selhaly."
                })
                # Pokud drink selhal a navíc je hlášena prázdná lahev, rovnou ji zablokujeme
                for i in failed_glasses:
                    if input_state.empty_bottle[i]:
                        # Zakážeme lahev a označíme ji jako prázdnou
                        bottles_state.disable_position(i, is_empty=True)
                        internal_notify("BOTTLE DISABLED", {"pos": i, "msg": f"Lahev {i} došla."})
            # -------------------------------------------

            # 4) PICKUP -> počkat na dokončení procesu (done/failed flags)
            await self._wait_for_pickup("pickup", self.timeout_pickup, internal_notify)

            result = {"ok": True, "stage": "done", "snapshot": self._snapshot()}
            internal_notify("POURING DONE", {"msg": "Hotovo.", **result})
            glasses_service.clear_glasses()
            return result

    # --------- Kroky – čisté a krátké ----------

    async def _sync_glasses_and_send(self, notify: NotifyFn) -> None:
        payload = glasses_service.set_from_temp_to_JSON_compact()
        if payload:
            send_json(payload)
        notify("POURING UART", {"msg": "Odeslán seznam sklenic do ESP.", "slots": list(glasses_state.get_glasses_in_list())})

    async def _sync_bottles_and_send(self, notify: NotifyFn) -> None:
        payload = bottles_state.to_position_json()
        if payload:
            send_json(payload)
        notify("POURING UART", {"msg": "Odeslány lahve do ESP.", "slots": list(bottles_state.get_bottle_assignments())})


    async def _send_check(self, enabled: bool, notify: NotifyFn) -> None:
        payload = system_state.set_state(check=enabled)
        send_json(payload)
        notify("POURING UART", {"msg": f"CHECK => {enabled}"})


    async def _send_start_pouring(self, notify: NotifyFn) -> None:
        input_state.pouring_done = False
        input_state.process_pouring_started = False

        payload = system_state.set_state(start=True)
        send_json(payload)
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

    def _have_errors(self) -> Optional[str]:
        if input_state.emergency_stop:
            return "EMERGENCY STOP"
        if input_state.mess_error:
            return "MECHANICAL/PROCESS ERROR"
        if input_state.cannot_process_position:
            return "CANNOT PROCESS POSITION"
        if input_state.cannot_process_glass:
            return "CANNOT PROCESS GLASS"
        if input_state.cannot_set_mode:
            return "CANNOT SET MODE"
        
        # ZDE BYLA KONTROLA EMPTY BOTTLE - musí být pryč!
        
        return None
    
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
            # Pokud v GlassesState nejsou žádné sklenice, CHECK nedává smysl
            return False

        pc = getattr(input_state, "position_check", None)

        print(f"[CHECK DBG] expected={expected} position_check={pc}")

        if not (isinstance(pc, list) and len(pc) >= 6):
            return False

        # Musí sedět přesně tam, kde čekáme sklenice
        if all(bool(pc[i]) for i in expected):
            return self._have_errors() is None

        return False

    async def _wait_until(self, predicate, timeout: float, stage: str) -> None:
        deadline = asyncio.get_event_loop().time() + timeout
        while True:
            # 1) nejdřív chyby
            err = self._have_errors()
            if err:
                raise PourError(stage, f"Chyba z ESP: {err}", self._snapshot())

            # 2) splněná podmínka?
            try:
                if predicate():
                    return
            except Exception as e:
                raise PourError(stage, f"Chyba evaluace podmínky: {e!r}", self._snapshot())

            # 3) timeout?
            if asyncio.get_event_loop().time() > deadline:
                raise PourError(stage, f"Timeout {timeout:.0f}s ve fázi '{stage}'.", self._snapshot())

            await asyncio.sleep(self.poll_dt)

    # --------- Snapshots pro log/debug ----------

    def _snapshot(self) -> Dict[str, Any]:
        return {
            "input": {
                "position_check": getattr(input_state, "position_check", None),
                "glass_done": getattr(input_state, "glass_done", None),
                "empty_bottle": getattr(input_state, "empty_bottle", None),
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
