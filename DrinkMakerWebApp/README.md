# DrinkMaker
REST API backend (FastAPI) + připraveno pro React frontend

- Spuštění docker compose
docker compose up -d

- Ověř běžící kontejnery
docker ps

- Pro nový build
docker compose up -d --build


- Zastavení docker compose – jen zastaví běžící kontejnery, ale nechá je vytvořené (můžeš je znovu spustit docker compose start).
docker compose stop 

- Zastaví a smaže kontejnery, ale nesmaže image ani volumes.
docker compose down

----------------------------------

docker stop $(docker ps -aq)
docker rm $(docker ps -aq)


docker rmi $(docker images -q)


docker compose up -d --build

docker run -d \
  --name dozzle \
  -p 9999:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  amir20/dozzle:latest

