# DrinkMakerWebApp

Webová aplikace pro ovládání robotického výdejníku nápojů. Systém se skládá z REST API backendu (FastAPI) a React frontendu. Komunikuje s hardwarem (ESP32/ESP32-C3) prostřednictvím UART a umožňuje lokální i vzdálené ovládání.

---

## Obsah

- [Architektura systému](#architektura-systému)
- [Adresářová struktura](#adresářová-struktura)
- [Technologický stack](#technologický-stack)
- [Spuštění aplikace](#spuštění-aplikace)
- [Backend – API přehled](#backend--api-přehled)
- [Backend – Datové modely](#backend--datové-modely)
- [Backend – Služby](#backend--služby)
- [Frontend – Stránky a komponenty](#frontend--stránky-a-komponenty)
- [UART komunikační protokol](#uart-komunikační-protokol)
- [Datový tok – příklad odlití nápoje](#datový-tok--příklad-odlití-nápoje)
- [Konfigurace](#konfigurace)

---

## Architektura systému

```
┌──────────────────────────────────────────────────────────────┐
│                 React Frontend (port 80)                      │
│  DashBoard → Bottles → NewDrink → OrderReview → Pouring      │
│  SWR polling každých 500 ms pro real-time aktualizace        │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTP REST API (port 8000)
┌───────────────────────▼──────────────────────────────────────┐
│              FastAPI Backend (Uvicorn)                        │
│  Bottles | Glasses | Pouring | Service | Firmware | Locks    │
│  Models: InputState, SystemState, BottlesState, GlassesState │
│  Services: UARTService, GlassesService, PouringProcessService│
└───────────────────────┬──────────────────────────────────────┘
                        │ UART 115200 baud
                        │ <JSON>…</JSON> / <STATE>…</STATE>
                ┌───────▼────────┐
                │  ESP32 / C3    │
                │ (karousel,     │
                │  ventily,      │
                │  váhy HX711)   │
                └────────────────┘

Persistentní úložiště: Docker volumes
  /app/data            – konfigurace lahví, stav nápojů
  /app/firmware_store  – firmware binárky pro OTA
```

---

## Adresářová struktura

```
DrinkMakerWebApp/
├── docker-compose.yml              # Orchestrace multi-container prostředí
├── Backend/
│   ├── Dockerfile
│   └── backend/
│       ├── main.py                 # Vstupní bod FastAPI aplikace
│       ├── requirements.txt
│       ├── api/
│       │   ├── bottles_api.py      # Správa lahví
│       │   ├── glasses_api.py      # Správa nápojů/skleniček
│       │   ├── pouring_api.py      # Řízení procesu plnění
│       │   ├── service_api.py      # Servisní operace (motory, ventily)
│       │   ├── endpoints_api.py    # Obecný stav, simulace
│       │   ├── firmware_api.py     # OTA aktualizace firmware
│       │   ├── rpi_api.py          # Systémové info Raspberry Pi
│       │   ├── locks_api.py        # Distribuované zámky
│       │   └── uart_test_api.py    # Testování UART
│       ├── models/
│       │   ├── bottles_state.py    # Stav inventáře lahví
│       │   ├── glasses_state.py    # Stav nápojů a skleniček
│       │   ├── input_state.py      # Vstupní stav z ESP32
│       │   ├── system_state.py     # Příkazy pro hardware
│       │   └── endpoints_schemas.py # Pydantic schémata
│       ├── services/
│       │   ├── uart_service.py         # UART komunikace s ESP32
│       │   ├── pouring_process_service.py # Orchestrace plnění
│       │   ├── glasses_service.py      # Business logika nápojů
│       │   └── storage_service.py      # Persistentní ukládání dat
│       └── core/
│           ├── all_states.py       # Singleton instance stavů
│           ├── locks.py            # Implementace zámků
│           └── storages.py         # Konfigurace úložiště
└── Frontend/
    ├── Dockerfile.prod / Dockerfile.dev
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx / AppRouter.jsx
        ├── pages/
        │   ├── DashBoard.jsx       # Hlavní přehled
        │   ├── AddNewDrink.jsx     # Přidání nápoje
        │   ├── Bottles.jsx         # Nastavení lahví
        │   ├── OrderReview.jsx     # Potvrzení objednávky
        │   ├── Pouring.jsx         # Vizualizace plnění
        │   └── ServicePages/       # Servisní rozhraní
        ├── components/
        │   ├── BottleSetUp.jsx
        │   ├── NewDrinkCom.jsx
        │   ├── IngredientCard.jsx
        │   ├── ErrorCom.jsx
        │   └── LoadingCom.jsx
        ├── hooks/
        │   ├── usePouringStatus.js
        │   ├── useStateData.js
        │   ├── useInputData.js
        │   ├── useGlassesData.js
        │   ├── useBottleData.js
        │   └── useServiceStatus.js
        └── services/
            ├── api.js
            ├── pouringService.js
            ├── glassesService.js
            ├── bottleService.js
            ├── stateService.js
            ├── lockService.js
            └── servicesService.js
```

---

## Technologický stack

### Backend

| Technologie | Verze | Účel |
|---|---|---|
| FastAPI | latest | REST API framework |
| Uvicorn | latest | ASGI server |
| Pydantic | latest | Validace dat |
| PySerial | latest | UART komunikace |
| PSUtil | latest | Systémové informace RPi |
| python-multipart | latest | Upload firmware souborů |
| python-dotenv | latest | Konfigurační proměnné |

### Frontend

| Technologie | Verze | Účel |
|---|---|---|
| React | 19.1.0 | UI framework |
| React Router DOM | 7.7.1 | Klientské routování |
| Vite | 7.0.4 | Build nástroj |
| SWR | 2.4.0 | Data fetching s cachováním |
| ESLint | 9.30.1 | Linting |

---

## Spuštění aplikace

### Produkční prostředí (Docker)

```bash
docker-compose up -d
```

- **Frontend**: http://\<ip-adresa\>
- **Backend API**: http://\<ip-adresa\>:8000
- **API dokumentace (Swagger)**: http://\<ip-adresa\>:8000/docs

### Vývojové prostředí

**Backend:**
```bash
cd Backend
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd Frontend
npm install
npm run dev
```

---

## Backend – API přehled

### Obecné (`/var`, `/remote`, `/sim`)

| Metoda | Endpoint | Popis |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/getStoredData` | Obsah persistentního datového souboru |
| GET | `/var/inputState` | Vstupní stav z ESP32 + stav lahví z RPi paměti |
| GET | `/var/systemState` | Aktuální systémový stav (příkazy pro ESP32) |
| GET | `/var/currentModeOnDevice` | Aktuální režim zařízení |
| POST | `/var/inputState/simulate` | Simulace vstupního stavu (testování) |
| POST | `/var/inputState/reset` | Reset vstupního stavu |
| POST | `/remote/setService` | Přechod do servisního režimu |
| POST | `/remote/resetService` | Ukončení servisního režimu |
| POST | `/remote/setStop` | Nouzové zastavení |
| POST | `/remote/resetStop` | Zrušení nouzového zastavení (errorAcknowledgment) |
| POST | `/remote/setParty` | Režim Party |
| POST | `/remote/resetParty` | Ukončení Party režimu |
| POST | `/remote/setPartySong` | Spuštění party songu (easter egg) |
| POST | `/sim/setStateToStandBy` | Simulace: stav StandBy |
| POST | `/sim/setStateToStop` | Simulace: stav Stop |
| POST | `/sim/setStateToService` | Simulace: stav Service |
| POST | `/sim/resetState` | Simulace: reset stavu |

### Správa lahví (`/bottles`)

| Metoda | Endpoint | Popis |
|---|---|---|
| GET | `/bottles/getBottles` | Seznam přiřazených lahví |
| POST | `/bottles/assigBottles` | Přiřazení lahve na pozici |
| POST | `/bottles/deleteBottleAtPosition` | Odebrání lahve z pozice |

### Správa nápojů (`/glasses`)

| Metoda | Endpoint | Popis |
|---|---|---|
| GET | `/glasses/glasses` | Všechny nápoje s ingrediencemi |
| GET | `/glasses/compactGlasses` | Nápoje v kompaktním formátu |
| GET | `/glasses/count` | Celkový počet připravených nápojů |
| GET | `/glasses/freePositions` | Dostupné volné pozice |
| POST | `/glasses/addGlassToPosition` | Přidání nápoje na pozici |
| POST | `/glasses/deleteGlassOnPosition` | Odebrání nápoje z pozice |
| POST | `/glasses/deleteAllGlasses` | Smazání všech nápojů |

### Proces plnění (`/pour`)

| Metoda | Endpoint | Popis |
|---|---|---|
| POST | `/pour/start` | Spuštění procesu plnění |
| GET | `/pour/status` | Stav průběhu plnění |
| GET | `/pour/state` | Zda plnění probíhá |
| POST | `/pour/cancel` | Zrušení probíhajícího plnění |

### Servisní operace (`/service`)

| Metoda | Endpoint | Popis |
|---|---|---|
| POST | `/service/motorCarouselRelease` | Uvolnění motoru karuselu |
| POST | `/service/motorCarouselBlock` | Zablokování motoru karuselu |
| POST | `/service/homeCarousel` | Najetí karuselu na home pozici |
| POST | `/service/moveCarousel` | Pohyb karuselu |
| POST | `/service/motorPlexiRelease` | Uvolnění motoru plexi plošiny |
| POST | `/service/motorPlexiBlock` | Zablokování motoru plexi plošiny |
| POST | `/service/homePlexi` | Najetí plošiny na home pozici |
| POST | `/service/movePlexi` | Pohyb plošiny |
| POST | `/service/setValve` | Ovládání ventilu (0–5, open/close) |
| POST | `/service/restartESP32` | Restart hlavního ESP32 |
| POST | `/service/restartCarouselESP` | Restart ESP na konkrétní pozici |
| POST | `/service/restartAllCarouselESPs` | Restart všech karuselových ESP |
| POST | `/service/calibratePosition` | Kalibrace pozice |
| POST | `/service/disablePosition` | Deaktivace pozice |
| POST | `/service/enablePosition` | Aktivace pozice |
| POST | `/service/markBottleFilled` | Označení lahve jako plné |

### Firmware (`/fw`)

| Metoda | Endpoint | Popis |
|---|---|---|
| POST | `/fw/upload` | Nahrání nového firmware binárky |
| GET | `/fw/manifest` | Informace o verzi firmware |
| GET | `/fw/bin` | Stažení firmware binárky |
| POST | `/fw/updateESP32` | OTA update hlavního ESP32 |
| POST | `/fw/updateCarouselESP` | OTA update ESP na pozici |
| POST | `/fw/updateAllCarouselESPs` | OTA update všech ESP |
| POST | `/fw/report` | Hlášení výsledku OTA z ESP |
| GET | `/fw/reports/show` | Přehled OTA reportů |

### Systém Raspberry Pi (`/system`)

| Metoda | Endpoint | Popis |
|---|---|---|
| GET | `/system/temperature` | Teplota CPU |
| GET | `/system/info` | Informace o systému (hostname, OS, architektura) |
| GET | `/system/disk` | Využití disku |

### Distribuované zámky (`/lock`)

| Metoda | Endpoint | Popis |
|---|---|---|
| GET | `/lock/status/{name}` | Stav zámku |
| POST | `/lock/acquire/{name}` | Získání zámku s TTL |
| POST | `/lock/heartbeat/{name}` | Prodloužení TTL zámku |
| POST | `/lock/release/{name}` | Uvolnění zámku |
| POST | `/lock/clear_all` | Vymazání všech zámků |

---

## Backend – Datové modely

### Režimy zařízení (`input_state.py`)

| Číslo | Název | Popis |
|---|---|---|
| 1 | STANDBY | Čeká na příkaz |
| 2 | STOP | Zastaveno / nouzový stav |
| 3 | CHECK | Kontrola pozic před plněním |
| 4 | POURING | Probíhá plnění |
| 5 | SERVICE | Servisní režim |
| 6 | UPDATE | OTA aktualizace firmware |
| 7 | PARTY | Party režim |

### Stav lahví (`bottles_state.py`)

- 6 pozic (0–5)
- Každá pozice: název lahve, příznak `disabled`, příznak `empty_bottle`
- Persistuje stav do Docker volume přes `storage_service`

### Stav nápojů (`glasses_state.py`)

- 6 pozic, každá s až 6 ingrediencemi
- Ingredience: seznam názvů + seznam objemů (ml)
- Sloučení duplicitních ingrediencí podle názvu
- Normalizace názvů

### Příkazy pro hardware (`system_state.py`)

Klíčové výstupní proměnné (Backend → ESP32 přes UART):

| UART klíč | Python parametr | Popis |
|---|---|---|
| `strt` / `stp` | `start` / `stop` | Start / Stop procesu |
| `chck` | `check` | Spuštění kontrolní fáze |
| `srvc` / `stnd` | `service` / `standBy` | Service / Standby režim |
| `prty` / `prtySng` | `party` / `partySong` | Party režim / Party song |
| `errAcknow` | `errorAcknowledgment` | Kvitace chyby (výstup ze STOP) |
| `opnVlvOnPos0–5` | `openValve0–5` | Otevření ventilu na pozici |
| `relsCarMtr` / `relsPlxMtr` | `releaseCarouselMotor` / `releasePlexiMotor` | Uvolnění motorů |
| `homeCarousel` / `homePlexi` | `homeCarousel` / `homePlexi` | Najetí na home |
| `moveCarousel` / `movePlexi` | `moveCarousel` / `movePlexi` | Pohyb karuselu / plošiny |
| `percentHeight` | `percentHeight` | Výška plošiny (0–100 %) |
| `resESP32` / `resESP_0–5` | `restartESP32` / `restartESP32C30–5` | Restart ESP32 |
| `updESP32` / `updESP_0–5` | `updateESP32` / `updateESP32C30–5` | OTA update ESP |
| `calibPos_0–5` | `calibratePosition0–5` | Kalibrace pozice |

### Vstupní stav z hardware (`input_state.py`)

Pole jsou dostupná přes REST API jako Python jména; UART klíče (ESP32 → RPi) jsou v závorce.

| API pole | UART klíč (ESP32 → RPi) | Typ | Popis |
|---|---|---|---|
| `position_check` | `pos_0_chck – pos_5_chck` | `bool[6]` | Potvrzení přítomnosti sklenice |
| `glass_done` | `glsDn_0 – glsDn_5` | `bool[6]` | Sklenice naplněna úspěšně |
| `glass_failed` | `glsFail_0 – glsFail_5` | `bool[6]` | Plnění selhalo |
| `HX711_error` | `HX711Err_0 – HX711Err_5` | `bool[6]` | Chyba váhového senzoru |
| `empty_bottle` | `emptBotAtPos_0–5` | `bool[6]` | Prázdná lahev na pozici |
| `tensometer_values` | `tensoValOnPos_0–5` | `float[6]` | Naměřená hodnota váhy (HX711) |
| `pouring_done` | `pourDone` | `bool` | Proces plnění dokončen |
| `process_pouring_started` | `procPouringStarted` | `bool` | Nalévání bylo zahájeno |
| `mess_error` / `mess_ok` | `messErr` / `messOk` | `bool` | Potvrzení / chyba UART zprávy |
| `cannot_process_position` | `canotProcPos` | `bool` | ESP nemůže zpracovat pozici |
| `cannot_process_glass` | `canotProcGls` | `bool` | ESP nemůže zpracovat sklenici |
| `cannot_set_mode` | `canotStMd` | `bool` | ESP nemůže přejít do daného režimu |
| `emergency_stop` | `emrgncyStopAppear` | `bool` | Nouzové zastavení |
| `State` (UART only) | `State` | `int 1–7` | Aktuální režim zařízení (viz tabulka módů) |

> **Poznámka:** Endpoint `/var/inputState` navíc vrací `position_disabled` (z `bottles_state` na RPi, nikoli z ESP32).

---

## Backend – Služby

### `uart_service.py` – UART komunikace

- Port: `/dev/serial0`, 115200 baud
- **JSON listener loop**: parsuje rámce `<JSON>…</JSON>` a `<STATE>…</STATE>`
- **Sender loop**: odesílá JSON příkazy s handshakingem
  - Čeká na potvrzení `messOk` (timeout 2 s)
  - Až 5 pokusů při selhání
  - Data rozdělena do 64bajtových paketů

### `pouring_process_service.py` – Orchestrace plnění

Stavový automat s fázemi:

| Fáze | Timeout | Popis |
|---|---|---|
| SYNC | – | Synchronizace lahví a sklenic do ESP32 přes UART |
| CHECK | 30 s | Kontrola přítomnosti sklenic (position_check) |
| POUR_START | 30 s | Čekání na potvrzení, že nalévání začalo (process_pouring_started) |
| POUR | 600 s | Vlastní plnění nápojů (čeká na pouring_done) |
| PICKUP | 120 s | Čekání na dokončení všech pozic (glass_done / glass_failed) |

Výsledky: `success` / `partial` / `failed` / `cancelled`

Automatické akce po plnění:
- Pozice s `empty_bottle=True` jsou automaticky deaktivovány v `bottles_state`
- `failed_details` obsahuje důvod selhání pro každou pozici (prázdná lahev / chyba HX711)
- Po úspěšném dokončení se všechny nápoje (`glasses_state`) automaticky vymažou

### `glasses_service.py` – Business logika nápojů

- In-memory seznam 6 slotů
- Validuje ingredience oproti dostupným lahvím
- Odstraní neplatné nápoje při změně konfigurace lahví

### `storage_service.py` – Persistentní ukládání

- Ukládá konfiguraci lahví a stav nápojů do Docker volumes
- Automatická obnova stavu po restartu

---

## Frontend – Stránky a komponenty

### Routování (`AppRouter.jsx`)

| Cesta | Komponenta | Popis |
|---|---|---|
| `/` | DashBoard | Hlavní přehled systému |
| `/bottles` | Bottles | Konfigurace lahví |
| `/newDrink` | AddNewDrink | Vytvoření nového nápoje |
| `/orderReview` | OrderReview | Potvrzení objednávky |
| `/pouring` | Pouring | Vizualizace procesu plnění |
| `/service/*` | ServicePages | Servisní rozhraní |

### Stránky

**DashBoard** – hlavní stránka systému. Zobrazuje aktuální režim, 6 stanovišť v kruhovém layoutu a tlačítka akcí.
- Klik na obsazené stanoviště otevře modal se složením nápoje a možností editace/smazání
- Klik na prázdné stanoviště přesměruje na AddNewDrink
- Servisní tlačítko zobrazuje badge s počtem problémů (prázdné lahve, HX711 chyby, deaktivované pozice)
- Vstup do servisu přes distribuovaný zámek (`/lock/acquire/service`) — pokud je servis obsazený, zobrazí varování
- STOP tlačítko uprostřed kruhu; přechod ze STOP vyžaduje checkbox-potvrzení v modalu
- `processPouringStarted=true` → automatická navigace na `/pouring`
- V Party módu: klik na nadpis „DrinkMaker" spustí party song (easter egg)

**Pouring** – real-time vizualizace průběhu plnění. Zobrazuje fázi, zprávy, úspěšné/neúspěšné pozice včetně důvodu selhání. Polling každých 500 ms přes `usePouringStatus`.

**OrderReview** – přehled všech 6 pozic s jejich nápoji a ingrediencemi před spuštěním plnění.

**AddNewDrink** – formulář pro přiřazení ingrediencí a objemů na pozici (max. 6 ingrediencí). Podporuje editační režim.

**Bottles** – konfigurace, která lahev je na které pozici. Označení prázdných/plných lahví.

**ServicePages** – manuální ovládání motorů, ventilů, kalibrace pozic, restart ESP32.

### Hooks (SWR)

| Hook | Endpoint | Interval | Poznámka |
|---|---|---|---|
| `usePouringStatus` | `/pour/status` | 500 ms | Stav průběhu plnění |
| `useStateStatus` | `/var/currentModeOnDevice` | 500 ms | Aktuální režim zařízení |
| `useInputData` | `/var/inputState` | 2 000 ms | Vstupní stav; vrací computed `problemsByPos`, `problemPositionsCount`, `totalProblemsCount` |
| `useInputDataFast` | `/var/inputState` | 1 000 ms | Rychlejší varianta, navíc vrací `tensometerValues` |
| `useGlassesData` | `/glasses/glasses` | on demand | – |
| `useBottleData` | `/bottles/getBottles` | on demand | – |
| `useServiceStatus` | `/lock/status/service` | 5 000 ms | Distribuovaný zámek servisu; vrací `isBusy` |

---

## UART komunikační protokol

### Formát rámců

```
Backend → ESP32:   <JSON>{"info":[{...payload...}]}</JSON>
ESP32 → Backend:   <STATE>{"State": 4}</STATE>
Potvrzení:         messOk: true  nebo  messErr: true
```

### Handshaking

1. Backend odešle JSON rámec (64bajtové pakety)
2. ESP32 zpracuje a odpoví `messOk: true` nebo `messErr: true`
3. Timeout 2 s, max. 5 pokusů
4. Při neúspěchu se záznam loguje

---

## Datový tok – příklad odlití nápoje

```
1.  [DashBoard]      Uživatel klikne na prázdné stanoviště
2.  [AddNewDrink]    Vybere ingredience + objemy, přiřadí na pozici
3.  [Frontend→API]   POST /glasses/addGlassToPosition
4.  [Backend]        Aktualizuje glasses_state, persistuje
5.  [OrderReview]    Zobrazí přehled všech 6 pozic
6.  [Frontend→API]   POST /pour/start
7.  [Backend]        Spustí PouringProcessService jako asyncio task
8.  [UART – SYNC]    Odešle seznam lahví + sklenic do ESP32
9.  [UART – CHECK]   Odešle CHECK příkaz → ESP32 zkontroluje sklenice (position_check)
10. [UART – START]   Odešle START příkaz → čeká na process_pouring_started=true
11. [UART – POUR]    ESP32 nalévá → čeká na pouring_done=true
12. [Backend]        Vyhodnotí výsledek, deaktivuje prázdné lahve, vymaže glasses_state
13. [UART – PICKUP]  Čeká na glass_done[i] nebo glass_failed[i] pro každou pozici
14. [Frontend]       Polling /pour/status každých 500 ms; input_state.process_pouring_started
                     → DashBoard automaticky přesměruje na /pouring
15. [Pouring]        Zobrazuje průběh, úspěšné/neúspěšné pozice + důvod selhání
16. [Dokončení]      Výsledek: success / partial / failed / cancelled
```

---

## Konfigurace

### Proměnné prostředí

**Frontend** (`.env.development` / `.env.production`):
```
VITE_API_URL=http://<backend-host>:8000
```

**Backend**:
```
FIRMWARE_STORE_DIR=/app/firmware_store
APP_DATA_DIR=/app/data
```

### CORS origins (pro vzdálený přístup)

- `http://localhost:5173` – lokální vývoj
- `http://192.168.1.111:5173` – RPi v lokální síti
- `http://127.0.0.1:5173` – lokální alternativa
- `http://100.115.134.119:5173` – Tailscale VPN

### Docker volumes

| Volume | Cesta v kontejneru | Obsah |
|---|---|---|
| `drinkmaker_data` | `/app/data` | Konfigurace lahví, stav nápojů |
| `firmware_store` | `/app/firmware_store` | Firmware binárky pro OTA |

### UART zařízení

- Port: `/dev/serial0`
- Baud rate: `115200`
- Mapování v docker-compose: `devices: - /dev/serial0:/dev/serial0`
