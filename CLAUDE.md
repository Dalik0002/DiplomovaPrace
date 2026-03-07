# CLAUDE.md — DrinkMaker Project

## Project Overview

This is a **Master's thesis project** (Diplomová Práce) implementing an **Automated Beverage Dispenser** (Automatizovaný Výrobník Nápojů). The system controls physical hardware (carousel, platform, valves, weight sensors) via a Raspberry Pi communicating with ESP32/ESP32-C3 microcontrollers over UART. A full-stack web application allows users to configure drinks, monitor hardware state, and trigger the dispensing process.

**Language note**: Comments, variable names, and some UI text may be in Czech. This is intentional.

---

## Repository Structure

```
DiplomovaPrace/
├── DrinkMakerWebApp/          # Main application
│   ├── Backend/               # Python FastAPI backend
│   │   ├── backend/           # Application source
│   │   │   ├── main.py        # FastAPI app entry point
│   │   │   ├── api/           # REST API route handlers
│   │   │   ├── models/        # Shared state objects (singletons)
│   │   │   ├── services/      # Business logic
│   │   │   ├── core/          # App-wide singletons and constants
│   │   │   └── requirements.txt
│   │   ├── startBackend.ps1   # Windows dev startup script
│   │   └── .env               # Backend env vars (empty by default)
│   ├── Frontend/              # React + Vite frontend
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── AppRouter.jsx  # Client-side routing
│   │   │   ├── pages/         # Full-page views
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── hooks/         # SWR polling hooks
│   │   │   └── services/      # API call wrappers
│   │   ├── .env.development   # Dev env (API at localhost:8000)
│   │   ├── .env.production    # Prod env (API at /api via Nginx proxy)
│   │   ├── Dockerfile.dev     # Node dev server
│   │   └── Dockerfile.prod    # Multi-stage nginx build
│   ├── docker-compose.yml     # Production deployment
│   └── README.md
├── UART/                      # UART testing scripts and examples
├── GIT/                       # Git workflow documentation
├── ZALOHY/                    # Backup files
└── README.md                  # Thesis description (Czech)
```

---

## Technology Stack

### Backend
- **Python** with **FastAPI** + **Uvicorn**
- **PySerial** — UART communication with ESP32 at `/dev/serial0`, 115200 baud
- **Pydantic** — data validation and state models
- **psutil** — system monitoring (CPU temp, disk, OS info)
- **python-dotenv** — environment variable loading
- **python-multipart** — firmware file uploads
- **JSON files** — persistent storage (no database)

### Frontend
- **React 19** with **Vite 7**
- **React Router DOM 7** — client-side routing
- **SWR 2** — data fetching with polling and cache

### Infrastructure
- **Docker + Docker Compose** — production deployment on Raspberry Pi
- **Nginx** — serves frontend static files, proxies `/api` → backend at port 8000
- Hardware: **Raspberry Pi** (host), **ESP32** (main controller), **ESP32-C3** (6× per position)

---

## Development Workflows

### Backend (Local Development)

**Windows** (PowerShell):
```powershell
cd DrinkMakerWebApp/Backend
./startBackend.ps1    # Creates venv, installs deps, starts uvicorn with --reload
```

**Manual** (Linux/Mac):
```bash
cd DrinkMakerWebApp/Backend
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend starts at `http://localhost:8000`. Swagger UI is available at `/docs`.

### Frontend (Local Development)

```bash
cd DrinkMakerWebApp/Frontend
npm install
npm run dev       # Vite dev server at http://localhost:5173
```

Uses `.env.development` → API proxied to `http://localhost:8000`.

### Production Deployment (Raspberry Pi)

```bash
cd DrinkMakerWebApp
docker-compose up -d --build
```

- Backend container: port 8000, mounts `/dev/serial0` for UART
- Frontend container: port 80, Nginx serves static build + proxies `/api`
- Persistent data stored in `drinkmaker_data` Docker volume
- Firmware files stored in `./firmware_store/`

---

## Architecture: State Model

All application state lives in **singleton instances** in `core/all_states.py`:

```python
glasses_state  = GlassesState()   # 6 staged drink positions (runtime only)
input_state    = InputState()     # Telemetry received FROM ESP32
system_state   = SystemState()    # Commands sent TO ESP32
bottles_state  = BottlesState()   # Bottle config (persisted to JSON)
```

These are imported across the codebase via `from core.all_states import *_state`.

---

## Architecture: UART Communication

The ESP32 communicates over UART using framed JSON:

**Receiving** (ESP32 → Pi): messages are wrapped as `<JSON>...</JSON>` or `<STATE>...</STATE>`
**Sending** (Pi → ESP32): messages are wrapped as `<JSON>...</JSON>\n`

### Message schemas

**FROM ESP32** — updates `InputState`:
```json
{"mess": [{"pos_0_chck": bool, "glsDn_0": bool, "glsFail_0": bool,
           "HX711Err_0": bool, "emptBotAtPos_0": bool, "tensoValOnPos_0": float,
           ... (indices 0-5 for each) ...,
           "pourDone": bool, "messErr": bool, "canotProcPos": bool,
           "canotProcGls": bool, "canotStMd": bool,
           "emrgncyStopAppear": bool, "procPouringStarted": bool}]}

{"State": 1}  // 1=STAND BY, 2=STOP, 3=CHECKING, 4=POURING,
               // 5=SERVICE, 6=UPDATING, 7=PARTYMODE
```

**TO ESP32** — built from `SystemState`:
```json
{"info": [{"strt": bool, "stp": bool, "chck": bool, "srvc": bool,
           "stnd": bool, "updt": bool, "prty": bool,
           "opnVlvOnPos0": bool, ..., "opnVlvOnPos5": bool,
           "relsCarMtr": bool, "relsPlxMtr": bool,
           "homeCarousel": bool, "homePlexi": bool,
           "movePlexi": bool, "percentHeight": int,
           "resESP32": bool, "resESP_0": bool, ..., "resESP_5": bool,
           "updESP32": bool, "updESP_0": bool, ..., "updESP_5": bool,
           "calibPos_0": bool, ..., "calibPos_5": bool}]}
```

UART background tasks are started in `main.py` `startup` event:
- `uart_JSON_listener_loop()` — receives and parses JSON/STATE frames
- `uart_sender_loop()` — drains the async send queue

Error detection: `messErr` flag triggers automatic resend of last sent message.

---

## Architecture: Pouring Process

`services/pouring_process_service.py` orchestrates the multi-phase pour:

1. **SYNC** — push `bottles_state` and `glasses_state` to ESP32
2. **CHECK** (30s timeout) — request hardware check; wait for mode=CHECKING
3. **POUR** (30s start + 600s complete) — trigger pour; wait for `pourDone`
4. **PICKUP** (120s) — wait for each glass to be `glassDone` or `glassFailed`

On `glassFailed`, if that bottle position is also `empty_bottle`, it is auto-disabled.

The pour runs as a FastAPI `BackgroundTask`. Status is polled via `GET /pour/status`.

---

## API Reference

All endpoints are prefixed with the router prefix (no global prefix in dev).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/var/inputState` | Full hardware telemetry + bottle status |
| GET | `/var/currentModeOnDevice` | Current ESP32 mode string |
| POST | `/var/inputState/simulate` | Inject test state (dev only) |
| POST | `/remote/setService` | Enter service mode |
| POST | `/remote/resetService` | Exit service mode |
| POST | `/remote/setStop` | Emergency stop |
| POST | `/remote/resetStop` | Clear stop |
| POST | `/remote/setParty` / `resetParty` | Party mode toggle |
| POST | `/pour/start` | Start pouring sequence |
| GET | `/pour/status` | Pouring progress and stage |
| POST | `/pour/cancel` | Cancel active pour |
| GET | `/glasses/glasses` | List 6 glass positions |
| GET | `/glasses/freePositions` | Available position indices |
| POST | `/glasses/addGlassToPosition` | Stage a drink at position |
| POST | `/glasses/deleteGlassOnPosition` | Remove a drink |
| POST | `/bottles/assigBottles` | Assign ingredients to bottle positions |
| GET | `/bottles/getBottles` | Get bottle assignments and status |
| POST | `/bottles/deleteBottleAtPosition` | Clear a bottle position |
| GET | `/lock/status/{name}` | Check distributed lock |
| POST | `/lock/acquire/{name}` | Acquire lock (15s TTL) |
| POST | `/lock/heartbeat/{name}` | Extend lock TTL |
| POST | `/lock/release/{name}` | Release lock |
| POST | `/lock/clear_all` | Clear all locks (admin) |
| GET | `/system/temperature` | CPU temperature |
| GET | `/system/info` | OS/hardware info |
| GET | `/system/disk` | Disk usage |
| POST | `/fw/upload` | Upload ESP firmware binary |
| GET | `/fw/manifest` | OTA manifest (version, SHA256, URL) |
| GET | `/fw/bin` | Download firmware binary |
| POST | `/fw/report` | ESP reports OTA result |
| GET | `/fw/reports/show` | OTA update history |
| Various | `/service/*` | Manual hardware control (valves, motors, calibration) |

### Pydantic request schemas (`api/endpoints_schemas.py`)

- `Glass` — `{name: str, ingredients: list[str], volumes: list[float]}`
- `GlassAtPosition` — `{position: int (0-5), glass: Glass}`
- `BottleAssignment` — `{position: int, bottle: str}`
- `HeightPlexi` — `{height: int (0-100)}`
- `ValveID` — `{valve_id: int (0-5), open: bool}`
- `LockRequest` — `{client_id: str}`

---

## Frontend Structure

### Pages (`src/pages/`)

| File | Route | Purpose |
|------|-------|---------|
| `DashBoard.jsx` | `/` | Main view: device status, staged drinks, start pour |
| `Glasses.jsx` | `/editGlasses` | View/edit glass recipes |
| `AddNewDrink.jsx` | `/newDrink` | Create a new drink recipe |
| `OrderReview.jsx` | `/orderReview` | Confirm staged drinks before pour |
| `Pouring.jsx` | `/pouring` | Live pouring progress monitor |
| `Bottles.jsx` | `/bottles` | Assign/manage bottle positions |
| `ServicePages/` | `/service/*` | Hardware service controls |

### Components (`src/components/`)

| File | Purpose |
|------|---------|
| `StateConteiner.jsx` | Displays current device mode badge |
| `GlassesConteiner.jsx` | Carousel of 6 glass position slots |
| `GlassesList.jsx` | List of all drink recipes |
| `BottleSetUp.jsx` | Bottle position assignment UI |
| `NewDrinkCom.jsx` | Form for creating/editing a drink |
| `OrderReviewCom.jsx` | Summary of staged drinks |
| `IngredientCard.jsx` | Single ingredient display card |
| `LoadingCom.jsx` | Spinner/loading state |
| `ErrorCom.jsx` | Error display component |

### Hooks (`src/hooks/`)

All hooks use **SWR** for polling. Do not add manual `setInterval` loops.

| Hook | Endpoint | Interval | Returns |
|------|----------|----------|---------|
| `useInputData` | `/var/inputState` | 2s | Per-position arrays + problem counts |
| `useInputDataFast` | `/var/inputState` | 1s | Same, faster refresh |
| `useStateStatus` | `/var/currentModeOnDevice` | 500ms | `isStop`, `isStandBy`, `isService`, `isParty` |
| `usePouringStatus` | `/pour/status` | 500ms | `isRunning`, `stage`, `isChecking`, `isPouring` |
| `useServiceStatus` | `/lock/status/service` | 5s | `isBusy`, lock owner, TTL |
| `useGlasses` | `/glasses/glasses` | — | 6-element position array |
| `useBottleData` | `/bottles/getBottles` | — | Bottle status array |

### Services (`src/services/`)

| File | Purpose |
|------|---------|
| `api.js` | Base `apiGet()`, `apiPost()` helpers (uses `VITE_API_URL`) |
| `stateService.js` | Mode transitions (service, stop, party) |
| `lockService.js` | Distributed lock management (client_id in localStorage) |
| `bottleService.js` | Bottle assignment calls |
| `general.js` | `startPouring()` |

---

## Key Conventions

### Backend

- **State is shared as module-level singletons** in `core/all_states.py`. Never instantiate new state objects in routers; always import from there.
- **All UART sends go through the queue**: use `send_json()` or `send_uart_command()` from `uart_service.py`, never write to serial directly.
- **Background tasks for long operations**: the pour process uses `BackgroundTasks`; pouring status is polled, not pushed.
- **No database**: persistent state is plain JSON at `APP_DATA_DIR/DrinkMaker_Data.json`. Only `BottlesState` persists; glasses are reset after each pour.
- **Pydantic models for all API I/O**: define request/response schemas in `api/endpoints_schemas.py`.
- **Hardware arrays are always length 6**: positions 0–5 correspond to physical bottle/glass slots.

### Frontend

- **SWR hooks for all polling**: data fetching lives in `src/hooks/`. Don't fetch directly in components.
- **API calls go through service files**: don't call `fetch()` directly in components; use `apiGet`/`apiPost` from `services/api.js`.
- **CSS files co-located with components**: `ComponentName.css` alongside `ComponentName.jsx`.
- **Lock heartbeat on service entry**: when entering service mode, the dashboard starts a heartbeat interval that must be cleared on exit.
- **Client ID is persistent**: `lockService.js` stores a UUID in `localStorage` under `drinkmaker_client_id`.

### Naming

- Backend: `snake_case` for Python files, variables, functions
- Frontend: `PascalCase` for components, `camelCase` for hooks/services/variables
- Note: "Conteiner" is a deliberate (Czech-influenced) spelling used throughout the codebase — do not "fix" it

---

## Environment Variables

### Backend (`DrinkMakerWebApp/Backend/backend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `FIRMWARE_STORE_DIR` | `./firmware_store` | Path for OTA firmware binaries |
| `APP_DATA_DIR` | `/app/data` | Path for persistent JSON storage |

### Frontend

**`.env.development`** (local dev):
```
VITE_API_URL=http://localhost:8000
VITE_API_URL_REMOTE=http://100.115.134.119
VITE_APP_NAME=DrinkMaker
VITE_DEBUG=true
```

**`.env.production`** (Raspberry Pi via Nginx):
```
VITE_API_URL=/api
VITE_APP_NAME=DrinkMaker
VITE_DEBUG=false
```

In production, Nginx on the frontend container proxies `/api` → `http://backend:8000`.

---

## Hardware Constraints

- UART is only available when running on Raspberry Pi with `/dev/serial0`. In development without hardware, the UART service will fail to open the port — this is expected. The backend still starts and can be tested via Swagger or the simulate endpoint (`POST /var/inputState/simulate`).
- The Docker Compose `devices` mapping passes `/dev/serial0` into the backend container. This only works on the RPi host.
- ESP32-C3 units (one per position, 6 total) handle individual valve control and weight sensing. The main ESP32 manages the carousel motor and platform/plexi motor.

---

## Testing

There is no automated test suite. Testing is done:
1. **UART scripts**: `/UART/Testing/UART_Test.py` — manual serial communication tests
2. **Swagger UI**: available at `http://localhost:8000/docs` during development
3. **State simulation**: `POST /var/inputState/simulate` injects fake hardware state for UI testing
4. **Hardware integration**: full end-to-end tests require physical hardware on RPi

---

## Common Tasks

**Add a new API endpoint:**
1. Create or edit a router file in `Backend/backend/api/`
2. Register it in `main.py` with `app.include_router(...)`
3. Add request/response schemas to `endpoints_schemas.py` if needed

**Add a new hardware command:**
1. Add the field to `SystemState` in `models/system_state.py`
2. Add a method on `SystemState` to set and auto-clear the flag
3. Expose via an endpoint in `service_api.py`

**Add a new frontend page:**
1. Create `PageName.jsx` (and `PageName.css`) in `src/pages/`
2. Add the route in `AppRouter.jsx`
3. Link from the relevant navigation element

**Add a new polling hook:**
1. Create `useHookName.js` in `src/hooks/`
2. Use `useSWR` with appropriate refresh interval
3. Import and use in the relevant component/page
