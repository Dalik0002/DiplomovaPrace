PC:
Tvorba:
python3 -m venv venv

Aktivace:
.\venv\Scripts\Activate.ps1

uvicorn main:app --reload

python -m uvicorn main:app --reload

http://127.0.0.1:8000/docs

.\startBackend.ps1


RPI:
Pro pozorování logu:
docker logs -f drinkmaker-backend

source venv/bin/activate


PEP8 konvence:
V Pythonu se hodně používají konvence PEP8 (oficiální stylopis).

🔹 Pojmenovávání v Pythonu
1. Moduly a soubory

vše malými písmeny, případně oddělené podtržítkem _

✅ all_states.py, glasses_state.py, system_state.py

❌ AllStates.py, SystemState.py

2. Třídy

PascalCase (každé slovo s velkým písmenem, bez podtržítek)

✅ class InputState:

✅ class GlassesState:

❌ class input_state:

❌ class inputstate:

3. Proměnné a instance objektů

malými písmeny, slova oddělovat podtržítkem _

✅ input_state = InputState()

✅ glasses_state = GlassesState()

❌ Input_State = InputState()

👉 Velká písmena se používají jen pro konstanty, ne pro instance.

4. Konstanty

velkými písmeny, případně s podtržítkem

✅ MAX_SPEED = 150

✅ DEFAULT_TIMEOUT = 10

5. Funkce a metody

stejně jako proměnné → snake_case

✅ def update_mode_from_json(self, msg):

❌ def UpdateModeFromJson(self, msg):

6. Balíčky (adresáře)

malé písmo, pokud víceslovné → s podtržítkem

✅ services/

✅ api_endpoints/

❌ Services/

UART:
| Název proměnné                | Typ              | Směr     |
|-------------------------------|------------------|----------|
| start                         | `bool`           | výstup   | 
| stop                          | `bool`           | výstup   | 
| check                         | `bool`           | výstup   | 
| service                       | `bool`           | výstup   | 
| standBy                       | `bool`           | výstup   | 
| update                        | `bool`           | výstup   | 
| openValveOnPosition0          | `bool`           | výstup   | 
| openValveOnPosition1          | `bool`           | výstup   | 
| openValveOnPosition2          | `bool`           | výstup   | 
| openValveOnPosition3          | `bool`           | výstup   | 
| openValveOnPosition4          | `bool`           | výstup   | 
| openValveOnPosition5          | `bool`           | výstup   | 
| releaseCarouselMotor          | `bool`           | výstup   | 
| releasePlexiMotor             | `bool`           | výstup   | 
| pouringHeight                 | `uint16_t`       | výstup   | 
| errorAcknowledgment           | `bool`           | výstup   | 
| restartESP32                  | `bool`           | výstup   | 
| restartESP_0                  | `bool`           | výstup   | 
| restartESP_1                  | `bool`           | výstup   | 
| restartESP_2                  | `bool`           | výstup   | 
| restartESP_3                  | `bool`           | výstup   | 
| restartESP_4                  | `bool`           | výstup   | 
| restartESP_5                  | `bool`           | výstup   | 
| updateESP32                   | `bool`           | výstup   | 
| updateESP_0                   | `bool`           | výstup   | 
| updateESP_1                   | `bool`           | výstup   | 
| updateESP_2                   | `bool`           | výstup   | 
| updateESP_3                   | `bool`           | výstup   | 
| updateESP_4                   | `bool`           | výstup   | 
| updateESP_5                   | `bool`           | výstup   | 
| ingredientOnPosition0         | `String`         | výstup   | 
| ingredientOnPosition1         | `String`         | výstup   | 
| ingredientOnPosition2         | `String`         | výstup   | 
| ingredientOnPosition3         | `String`         | výstup   | 
| ingredientOnPosition4         | `String`         | výstup   | 
| ingredientOnPosition5         | `String`         | výstup   | 

---------------------------------------------------------------
| Název proměnné                | Typ              | Směr     |
|-------------------------------|------------------|----------|
| position_0_check              | `bool`           | vstup    | 
| position_1_check              | `bool`           | vstup    | 
| position_2_check              | `bool`           | vstup    | 
| position_3_check              | `bool`           | vstup    | 
| position_4_check              | `bool`           | vstup    | 
| position_5_check              | `bool`           | vstup    | 
| glassDone_0                   | `bool`           | vstup    | 
| glassDone_1                   | `bool`           | vstup    | 
| glassDone_2                   | `bool`           | vstup    | 
| glassDone_3                   | `bool`           | vstup    | 
| glassDone_4                   | `bool`           | vstup    | 
| glassDone_5                   | `bool`           | vstup    | 
| emptyBottleAtPosition_0       | `bool`           | vstup    | 
| emptyBottleAtPosition_1       | `bool`           | vstup    | 
| emptyBottleAtPosition_2       | `bool`           | vstup    | 
| emptyBottleAtPosition_3       | `bool`           | vstup    | 
| emptyBottleAtPosition_4       | `bool`           | vstup    | 
| emptyBottleAtPosition_5       | `bool`           | vstup    | 
| pouringDone                   | `bool`           | vstup    | 
| messError                     | `bool`           | vstup    | 
| cannotProcessPosition         | `bool`           | vstup    | 
| cannotProcessGlass            | `bool`           | vstup    | 
| cannotSetMode                 | `bool`           | vstup    | 
| emergencyStopAppeared         | `bool`           | vstup    | 

JSON mess:
Info:
{"info":[{"strt":false,"stp":false,"chck":false,"srvc":false,"stnd":true,"upd":false,"opnVlvOnPos0":false,"opnVlvOnPos1":false,"opnVlvOnPos2":false,"opnVlvOnPos3":false,"opnVlvOnPos4":false,"opnVlvOnPos5":false,"relsCarMtr":false,"relsPlxMtr":false,"pourHght":150,"errAcknow":true,"resESP32":false,"resESP_0":false,"resESP_1":false,"resESP_2":false,"resESP_3":false,"resESP_4":false,"resESP_5":false,"updESP32":false,"updESP_0":false,"updESP_1":false,"updESP_2":false,"updESP_3":false,"updESP_4":false,"updESP_5":false}]}

glasses:
{"glasses":{"pos_0":[{"nm":"Pepsi Cola","vol":245},{"nm":"Rum","vol":248},{"nm":"Jack Daniels","vol":239},{"nm":"","vol":0},{"nm":"Gin","vol":235},{"nm":"Tonic","vol":242}],"pos_1":[{"nm":"Rum","vol":249},{"nm":"Gin","vol":247},{"nm":"Tonic","vol":238},{"nm":"Jack Daniels","vol":236},{"nm":"Vodka","vol":233},{"nm":"Pepsi Cola","vol":230}],"pos_2":[{"nm":"","vol":0},{"nm":"","vol":0},{"nm":"","vol":0},{"nm":"","vol":0},{"nm":"","vol":0},{"nm":"","vol":0}],"pos_3":[{"nm":"","vol":0},{"nm":"Jack Daniels","vol":240},{"nm":"Rum","vol":243},{"nm":"Tonic","vol":239},{"nm":"Vodka","vol":247},{"nm":"Pepsi Cola","vol":232}],"pos_4":[{"nm":"Gin","vol":238},{"nm":"Jack Daniels","vol":237},{"nm":"Vodka","vol":235},{"nm":"Tonic","vol":234},{"nm":"Pepsi Cola","vol":233},{"nm":"Rum","vol":230}],"pos_5":[{"nm":"Pepsi Cola","vol":245},{"nm":"Jack Daniels","vol":236},{"nm":"Vodka","vol":248},{"nm":"Tonic","vol":239},{"nm":"Gin","vol":237},{"nm":"Rum","vol":233}]}}

position:
{"bottOnPos":[{"pos_0":"Pepsi Cola","pos_1":"Rum","pos_2":"Jack Daniels","pos_3":"Vodka","pos_4":"Gin","pos_5":"Tonic"}]}