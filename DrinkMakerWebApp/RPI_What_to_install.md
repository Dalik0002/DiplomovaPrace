Co nainstalovat:

vždy:
sudo apt update && sudo apt upgrade -y

1) Zapni HW UART na Raspberry Pi
Rychle přes raspi-config

sudo raspi-config
# Interface Options -> Serial Port
#   - Login shell over serial?  -> No
#   - Enable serial hardware?   -> Yes
sudo reboot


Docker:
sudo apt install -y ca-certificates curl gnupg lsb-release

curl -fsSL https://get.docker.com | sudo sh

sudo usermod -aG docker $USER

newgrp docker

docker --version
docker compose version


Others:
sudo apt istall git -y
sudo apt istall mc -y
sudo apt istall btop -y


GIT clone:
git clone --branch rpi --single-branch https://github.com/Dalik0002/DiplomovaPrace.git GIT


NOT GUUD:
docker run -d \
  --name dozzle \
  -p 9999:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  amir20/dozzle:latest