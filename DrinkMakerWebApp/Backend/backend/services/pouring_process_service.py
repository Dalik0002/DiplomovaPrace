# PoweringProcessService.py
# Orchestrace procesu: poslat sklenice -> CHECK -> POUR -> čekat na dokončení -> čekat na vyzvednutí sklenic
# Autor: ChatGPT (upraveno pro DrinkMaker architekturu)
from __future__ import annotations
import asyncio
from dataclasses import dataclass
from typing import Callable, Optional, Dict, Any

# --- Importy sdílených stavů (už je máš v projektu) ---
from core.all_states import system_state, input_state, system_state, glasses_state

#send_json(glasses_state.to_info_json())

# --- Typy a výjimky ---
@dataclass
class ProcessResult:
    ok: bool
    stage: str
    detail: str
    data: Dict[str, Any]

class ProcessError(RuntimeError):
    def __init__(self, stage: str, message: str, data: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.stage = stage
        self.data = data or {}

# Typ notifikačního callbacku pro log/WS/frontend události
NotifyFn = Callable[[str, Dict[str, Any]], None]


class PoweringProcessService:
    """
    Jediný orchestrátor "zahájit nalévání".
    - Nespustí se paralelně dvakrát (guard).
    - Vše běží asynchronně (neblokuje FastAPI).
    - Defenzivní kontroly chybových stavů z ESP (emergency_stop, empty_bottle, mess_error, ...).
    - Lze napojit volitelný notify() (log, WebSocket, SSE…).
    """

    def __init__(self, uart):
        """
        :param uart: objekt s metodami pro odeslání příkazů na ESP32.
                     Očekává se rozhraní:
                       - send_glasses(glasses_dict: dict) -> None
                       - send_check(enabled: bool) -> None
                       - send_start_pouring() -> None
                       - send_mode(mode: str) -> None  (volitelné)
        """
        self.uart = uart
        self._lock = asyncio.Lock()         # chrání před paralelním během
        self._task: Optional[asyncio.Task] = None

        # Výchozí timeouty (uprav si dle reality stroje)
        self.timeout_check = 20.0           # s – čekání na úspěšný CHECK
        self.timeout_pour = 300.0           # s – čekání na dokončení nalévání (celkově)
        self.timeout_pickup = 180.0         # s – čekání na vyzvednutí sklenic

        # Perioda vnitřního "pollingu" sdílené paměti (nezatěžovat)
        self.poll_dt = 0.05                 # s

    # ------------------------ Veřejné API ------------------------

    def running(self) -> bool:
        return self._task is not None and not self._task.done()

    def cancel(self):
        """Nouzově zrušit probíhající proces (např. z API)."""
        if self._task and not self._task.done():
            self._task.cancel()

    def start_bg(self, glasses_payload: Dict[str, Any], notify: Optional[NotifyFn] = None) -> None:
        """
        Spustí proces na pozadí (neblokuje volající endpoint).
        """
        if self.running():
            raise ProcessError("guard", "Proces již běží.", {})
        self._task = asyncio.create_task(self.start(glasses_payload, notify=notify))

    async def start(self, glasses_payload: Dict[str, Any], notify: Optional[NotifyFn] = None) -> ProcessResult:
        """
        Hlavní orchestrátor – možno i awaitovat přímo (třeba v jobu).
        """
        if notify is None:
            notify = lambda stage, data: None  # no-op

        async with self._lock:  # dodatečná pojistka proti paralelnímu vstupu
            try:
                notify("init", {"msg": "Zahajuji proces.", "glasses": glasses_payload})

                # 1) Zasypat system_state a poslat je do ESP
                self._apply_glasses_to_memory(glasses_payload)
                await self._uart_send_glasses(glasses_payload, notify)

                # (Volitelné) přepnout režim na CheckMode – pokud to tak máš ve FW
                await self._uart_send_mode_if_available("CheckMode", notify)

                # 2) Odeslat CHECK=TRUE (ESP provede mechanické/bezpečnostní ověření)
                await self._uart_send_check(True, notify)

                # 3) Počkat na úspěšný CHECK (nebo chybu)
                await self._wait_for_check_ok(notify, timeout=self.timeout_check)

                # (Volitelné) přepnout režim na PouringMode – podle FW
                await self._uart_send_mode_if_available("PouringMode", notify)

                # 4) Odeslat START POUR
                await self._uart_send_start_pouring(notify)

                # 5) Čekat na dokončení nalévání
                await self._wait_for_pouring_done(notify, timeout=self.timeout_pour)

                # 6) Po nalití čekat, až uživatel vyzvedne sklenice
                await self._wait_for_pickup(notify, timeout=self.timeout_pickup)

                result = ProcessResult(ok=True, stage="done", detail="Hotovo.", data=self._export_state_snapshot())
                notify("done", {"msg": "Proces úspěšně dokončen.", **result.data})
                return result

            except asyncio.CancelledError:
                notify("cancelled", {"msg": "Proces byl zrušen."})
                raise
            except ProcessError as e:
                notify("error", {"stage": e.stage, "msg": str(e), **(e.data or {})})
                return ProcessResult(ok=False, stage=e.stage, detail=str(e), data=e.data or {})
            except Exception as e:
                notify("error", {"stage": "unexpected", "msg": repr(e)})
                return ProcessResult(ok=False, stage="unexpected", detail=repr(e), data={})

    # ------------------------ Interní kroky ------------------------

    def _apply_glasses_to_memory(self, glasses_payload: Dict[str, Any]) -> None:
        """
        Naplní system_state daty pro jednotlivé sklenky.
        Očekává se, že už máš vlastní metody/settery.
        """
        # Přizpůsob si dle své struktury system_state
        # Příklad: system_state.set_from_api_payload(glasses_payload)
        if hasattr(system_state, "set_from_api_payload"):
            system_state.set_from_api_payload(glasses_payload)
        else:
            # Fallback – uloží přímo (při vlastním řešení si udělej settery)
            system_state.glasses = glasses_payload

    async def _uart_send_glasses(self, glasses_payload: Dict[str, Any], notify: NotifyFn) -> None:
        if not hasattr(self.uart, "send_glasses"):
            raise ProcessError("uart", "UART vrstva neimplementuje send_glasses().")
        self.uart.send_glasses(glasses_payload)
        notify("uart", {"msg": "Odeslány sklenice do ESP.", "count": len(glasses_payload or {})})

    async def _uart_send_check(self, enabled: bool, notify: NotifyFn) -> None:
        if not hasattr(self.uart, "send_check"):
            raise ProcessError("uart", "UART vrstva neimplementuje send_check().")
        self.uart.send_check(enabled)
        notify("uart", {"msg": f"CHECK => {enabled}"})

    async def _uart_send_start_pouring(self, notify: NotifyFn) -> None:
        if not hasattr(self.uart, "send_start_pouring"):
            raise ProcessError("uart", "UART vrstva neimplementuje send_start_pouring().")
        self.uart.send_start_pouring()
        notify("uart", {"msg": "START POUR odeslán."})

    async def _uart_send_mode_if_available(self, mode: str, notify: NotifyFn) -> None:
        if hasattr(self.uart, "send_mode"):
            try:
                self.uart.send_mode(mode)
                notify("uart", {"msg": f"Režim => {mode}"})
            except Exception:
                # Režim je volitelný – nepadat na tom
                notify("uart", {"msg": f"Režim {mode} se nepodařilo nastavit (ignoruji)."})
        # pokud UART nemá send_mode, tiše ignorujeme

    # ------------------------ Čekací podmínky ------------------------

    async def _wait_for_check_ok(self, notify: NotifyFn, timeout: float) -> None:
        """
        Čeká, než ESP potvrdí, že CHECK proběhl OK.
        Preferuje příznak 'input_state.check_ok' (pokud existuje),
        jinak používá rozumné náhradní podmínky (position_check True & žádné chyby).
        """
        notify("wait", {"stage": "check", "msg": "Čekám na dokončení CHECK..."})
        cond = self._check_ok_condition
        await self._wait_until(cond, timeout, "check", extra_snapshot=True)

    async def _wait_for_pouring_done(self, notify: NotifyFn, timeout: float) -> None:
        """
        Čeká na system_state.pouring_done == True (viz tvůj to_dict v SystemState).
        """
        notify("wait", {"stage": "pour", "msg": "Čekám na dokončení nalévání..."})
        cond = lambda: bool(getattr(system_state, "pouring_done", False))
        await self._wait_until(cond, timeout, "pour", extra_snapshot=True)

    async def _wait_for_pickup(self, notify: NotifyFn, timeout: float) -> None:
        """
        Po dokončení nalévání čeká, až budou sklenice vyzvednuty.
        Preferuje 'input_state.position_check == False' nebo speciální 'input_state.glasses_present == False',
        případně 'system_state.glass_done == True' pro všechny pozice – uprav dle FW.
        """
        notify("wait", {"stage": "pickup", "msg": "Čekám na vyzvednutí sklenic..."})

        def cond() -> bool:
            # 1) pokud máš příznak glasses_present:
            if hasattr(input_state, "glasses_present"):
                return not bool(getattr(input_state, "glasses_present"))
            # 2) fallback: kontrola snímače pozice (position_check == False => nic tam není)
            if hasattr(input_state, "position_check"):
                if not bool(getattr(input_state, "position_check")):
                    return True
            # 3) alternativa: všechny sklenice jako 'glass_done' (pokud FW takto reportuje)
            if hasattr(system_state, "glass_done"):
                return bool(getattr(system_state, "glass_done"))
            return False

        await self._wait_until(cond, timeout, "pickup", extra_snapshot=True)

    # ------------------------ Pomocné funkce ------------------------

    def _export_state_snapshot(self) -> Dict[str, Any]:
        # Udělej kompaktní snapshot pro log/notify – přizpůsob si podle svých tříd
        def safe(obj, fields):
            out = {}
            for f in fields:
                out[f] = getattr(obj, f, None)
            return out

        system = safe(
            system_state,
            [
                "position_check", "glass_done", "empty_bottle", "pouring_done",
                "mess_error", "cannot_process_position", "cannot_process_glass",
                "cannot_set_mode", "emergency_stop",
            ],
        )
        input_ = {}
        for name in ("check_ok", "position_check", "glasses_present", "current_mode"):
            input_[name] = getattr(input_state, name, None)
        return {"system": system, "input": input_}

    def _have_errors(self) -> Optional[str]:
        """
        Zkontroluje chybové příznaky, které máš ve SystemState.
        Pokud je cokoliv špatně, vrátí stručný popis (jinak None).
        """
        # Dle tvého to_dict: position_check, glass_done, empty_bottle, pouring_done,
        # mess_error, cannot_process_position, cannot_process_glass, cannot_set_mode, emergency_stop
        if getattr(system_state, "emergency_stop", False):
            return "EMERGENCY STOP"
        if getattr(system_state, "mess_error", False):
            return "MECHANICAL/PROCESS ERROR"
        if getattr(system_state, "empty_bottle", False):
            return "EMPTY BOTTLE"
        if getattr(system_state, "cannot_process_position", False):
            return "CANNOT PROCESS POSITION"
        if getattr(system_state, "cannot_process_glass", False):
            return "CANNOT PROCESS GLASS"
        if getattr(system_state, "cannot_set_mode", False):
            return "CANNOT SET MODE"
        return None

    def _check_ok_condition(self) -> bool:
        """
        Primárně čteme input_state.check_ok; pokud není, použijeme:
        - position_check True (na místě je validní sklenka)
        - a zároveň nejsou žádné chyby
        """
        if hasattr(input_state, "check_ok"):
            if bool(getattr(input_state, "check_ok")):
                return True
        if getattr(input_state, "position_check", None) is not None:
            if bool(getattr(input_state, "position_check")) and self._have_errors() is None:
                return True
        return False

    async def _wait_until(self, predicate, timeout: float, stage: str, extra_snapshot: bool = False) -> None:
        """
        Obecné asynchronní čekání s kontrolou chyb a timeoutem.
        """
        deadline = asyncio.get_event_loop().time() + timeout
        while True:
            # 1) nejdřív chyby
            err = self._have_errors()
            if err:
                raise ProcessError(stage, f"Chyba z ESP: {err}", self._export_state_snapshot() if extra_snapshot else {})

            # 2) pak podmínka
            try:
                if predicate():
                    return
            except Exception as e:
                raise ProcessError(stage, f"Chyba evaluace podmínky: {e!r}")

            # 3) timeout?
            if asyncio.get_event_loop().time() > deadline:
                raise ProcessError(stage, f"Timeout ({timeout:.0f}s) ve fázi '{stage}'.",
                                   self._export_state_snapshot() if extra_snapshot else {})

            await asyncio.sleep(self.poll_dt)


# ------------------------ Příklad napojení ve FastAPI routeru ------------------------
# (Volitelné – pokud chceš, vlož do svého routeru)
"""
from fastapi import APIRouter, BackgroundTasks, HTTPException
from services.uart_service import uart_singleton  # tvoje UART vrstva
from PoweringProcessService import PoweringProcessService, ProcessError

router = APIRouter(tags=["Pouring"])

service = PoweringProcessService(uart_singleton)

def notify(stage: str, data: dict):
    # sem si dej log, WS broadcast, atd.
    print(f"[{stage}] {data}")

@router.post("/pour/start")
async def start_pouring(glasses: dict, background_tasks: BackgroundTasks):
    # glasses = payload, který "vsypeš" do GlassesState (např. {1:{ingredient:"Rum", volume:50}, ...})
    try:
        # běh na pozadí (SSE/WS ať informuje front-end)
        background_tasks.add_task(service.start, glasses, notify)
        return {"status": "started"}
    except ProcessError as e:
        raise HTTPException(status_code=409, detail={"stage": e.stage, "msg": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=repr(e))

@router.post("/pour/cancel")
async def cancel_pouring():
    service.cancel()
    return {"status": "cancelling"}

@router.get("/pour/state")
async def pour_state():
    return {
        "running": service.running(),
        "snapshot": service._export_state_snapshot(),
    }
"""
