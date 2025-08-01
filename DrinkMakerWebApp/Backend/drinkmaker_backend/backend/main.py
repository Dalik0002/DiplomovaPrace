from fastapi import FastAPI
from api.endpoints import router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Přidání složky se statickými soubory
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return {"message": "DrinkMaker backend běží!"}

# Odpověď na /favicon.ico
@app.get("/favicon.ico")
async def favicon():
    from fastapi.responses import FileResponse
    return FileResponse("static/favicon.ico")