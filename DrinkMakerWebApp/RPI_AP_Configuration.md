Vytvoření AP:

1️⃣ Zkontroluj aktivní správce sítě
V Bookwormu je defaultně NetworkManager, ale někdy ještě běží dhcpcd.
Zkontroluj:

sudo systemctl status NetworkManager
sudo systemctl status dhcpcd

Pokud dhcpcd běží, vypni ho:

sudo systemctl disable --now dhcpcd

2️⃣ Zapni Wi-Fi adaptér

nmcli radio wifi on


3️⃣ Vytvoř Wi-Fi Access Point (AP)

sudo nmcli dev wifi hotspot ifname wlan0 ssid "DrinkMaker_AP" password "panoramix"

4️⃣ Zkontroluj konfiguraci

nmcli con show

Uvidíš něco jako:
NAME                UUID                                  TYPE      DEVICE
Hotspot             7fb67546-1034-435e-8bec-2e63f1b0069e  wifi      wlan0
Wired connection 1  61f60c37-809e-393d-8659-a3d597d04e0b  ethernet  eth0
lo                  aa28e09a-b10c-4580-8b4a-89b59832ce50  loopback  lo

Zkontroluj detaily hotspotu:
nmcli con show Hotspot


5️⃣ Uprav nastavení hotspotu

sudo nmcli con modify Hotspot ipv4.method manual
sudo nmcli con modify Hotspot ipv4.addresses 192.168.50.1/24
sudo nmcli con modify Hotspot ipv4.gateway ""
sudo nmcli con modify Hotspot ipv4.dns ""
sudo nmcli con up Hotspot

6️⃣ Ethernet jako management port (radši)

sudo nmcli connection modify "Wired connection 1" ipv4.method auto

7️⃣ Restart

sudo reboot

8️⃣ Jak to spravovat

Z terminálu:
nmcli con up Hotspot
nmcli con down Hotspot

9️⃣ Nastav automatické spouštění

sudo nmcli connection modify Hotspot connection.autoconnect yes


CHATGPT:
https://chatgpt.com/share/68efca99-b300-800b-ab4c-4d96a32b1ec4

