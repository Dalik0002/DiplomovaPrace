PC:
Tvorba:
python3 -m venv venv

Aktivace:
.\venv\Scripts\Activate.ps1

pip install -r .\backend\requirements.txt

uvicorn main:app --reload

python -m uvicorn main:app --reload

http://127.0.0.1:8000/docs



.\startBackend.ps1


RPI:
Pro pozorování logu:
docker logs -f drinkmaker-backend

source venv/bin/activate



