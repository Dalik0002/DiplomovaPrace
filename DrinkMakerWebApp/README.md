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
| GET | `/var/inputState` | Aktuální vstupní stav z ESP32 |
| GET | `/var/systemState` | Aktuální systémový stav (příkazy) |
| GET | `/var/currentModeOnDevice` | Aktuální režim zařízení |
| POST | `/var/inputState/simulate` | Simulace vstupního stavu (testování) |
| POST | `/var/inputState/reset` | Reset vstupního stavu |
| POST | `/remote/setService` | Přechod do servisního režimu |
| POST | `/remote/resetService` | Ukončení servisního režimu |
| POST | `/remote/setStop` | Nouzové zastavení |
| POST | `/remote/resetStop` | Zrušení nouzového zastavení |
| POST | `/remote/setParty` | Režim Party |
| POST | `/remote/resetParty` | Ukončení Party režimu |
| POST | `/sim/setStateToStandBy` | Simulace: stav StandBy |
| POST | `/sim/setStateToStop` | Simulace: stav Stop |
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

| Proměnná | Popis |
|---|---|
| `strt` / `stp` | Start / Stop procesu |
| `chck` | Spuštění kontrolní fáze |
| `srvc` / `stnd` / `prty` | Service / Standby / Party režim |
| `opnVlvOnPos0–5` | Otevření ventilu na pozici |
| `relsCarMtr` / `relsPlxMtr` | Uvolnění motorů |
| `homeCarousel` / `homePlexi` | Najetí na home |
| `movePlexi` / `percentHeight` | Pohyb plošiny (0–100 %) |
| `resESP32` / `resESP_0–5` | Restart ESP32 |
| `updESP32` / `updESP_0–5` | OTA update ESP |
| `calibPos_0–5` | Kalibrace pozice |

### Vstupní stav z hardware (`input_state.py`)

| Proměnná | Popis |
|---|---|
| `pos_0_chck – pos_5_chck` | Potvrzení přítomnosti sklenice |
| `glsDn_0 – glsDn_5` | Sklenice naplněna úspěšně |
| `glsFail_0 – glsFail_5` | Plnění selhalo |
| `emptBotAtPos_0–5` | Prázdná lahev na pozici |
| `tensoValOnPos_0–5` | Hodnota váhy (HX711) |
| `emrgncyStopAppear` | Nouzové zastavení |
| `messErr` / `messOk` | Potvrzení UART zprávy |
| `pourDone` | Proces plnění dokončen |
| `State` | Aktuální režim zařízení (1–7) |

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
| SYNC | – | Synchronizace stavu |
| CHECK | 30 s | Kontrola přítomnosti sklenic |
| POUR | 600 s | Vlastní plnění nápojů |
| PICKUP | 120 s | Čekání na odebrání sklenic |

Výsledky: `success` / `partial` / `failed` / `cancelled`

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

**DashBoard** – zobrazuje aktuální režim, nápoje v přípravě, inventář lahví. Obsahuje tlačítka pro přechod do Service/Party/Stop režimu a navigaci na ostatní stránky.

**Pouring** – real-time vizualizace průběhu plnění. Zobrazuje fázi, zprávy, úspěšné/neúspěšné pozice. Polling každých 500 ms přes SWR hook `usePouringStatus`.

**OrderReview** – přehled všech 6 pozic s jejich nápoji a ingrediencemi před spuštěním plnění.

**AddNewDrink** – formulář pro přiřazení ingrediencí a objemů na pozici (max. 6 ingrediencí).

**Bottles** – konfigurace, která lahev je na které pozici. Označení prázdných/plných lahví.

**ServicePages** – manuální ovládání motorů, ventilů, kalibrace pozic, restart ESP32.

### Hooks (SWR)

| Hook | Endpoint | Interval |
|---|---|---|
| `usePouringStatus` | `/pour/status` | 500 ms |
| `useStateData` | `/var/systemState` | 500 ms |
| `useInputData` | `/var/inputState` | 500 ms |
| `useGlassesData` | `/glasses/glasses` | on demand |
| `useBottleData` | `/bottles/getBottles` | on demand |
| `useServiceStatus` | `/var/currentModeOnDevice` | 1 s |

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
1. [DashBoard]      Uživatel klikne "Add Drink"
2. [AddNewDrink]    Vybere ingredience + objemy, přiřadí na pozici
3. [Frontend→API]   POST /glasses/addGlassToPosition
4. [Backend]        Aktualizuje glasses_state, persistuje
5. [OrderReview]    Zobrazí přehled všech 6 pozic
6. [Frontend→API]   POST /pour/start
7. [Backend]        Spustí PouringProcessService (async)
8. [UART]           Odešle CHECK příkaz → ESP32 potvrdí pozice
9. [UART]           Odešle POUR příkaz → ESP32 spustí plnění
10. [Frontend]      Polling /pour/status každých 500 ms
11. [Pouring]       Zobrazuje průběh, úspěšné/neúspěšné pozice
12. [Dokončení]     Výsledek: success / partial / failed
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
