200 OK
→ defaultně, pokud funkce vrátí dict a nic nehází výjimku. Znamená „všechno v pořádku“.

423 Locked
→ znamená, že zdroj (v tvém případě „service“) je uzamčený a klient k němu nemá přístup.
Používá se typicky když služba už je obsazená někým jiným.
(service_acquire → service is busy)

409 Conflict
→ znamená, že požadavek nelze splnit kvůli konfliktu stavu.
Typicky: klient poslal heartbeat nebo release, ale ve skutečnosti není vlastníkem locku.
(service_heartbeat / service_release → not_owner)

400 Bad Request
(nepřímo v _client_id_or_400) → klient neposlal validní ClientId.
Používá se když je chyba na straně klienta v syntaxi / datech.


📌 Obecné rozdělení kódů
2xx → úspěch (200 OK, 201 Created, 204 No Content)

3xx → přesměrování (301 Moved Permanently, 302 Found)

4xx → chyba na straně klienta

400 Bad Request → špatná data

401 Unauthorized → chybí autentizace

403 Forbidden → zakázáno

404 Not Found → neexistuje

409 Conflict → stavový konflikt

423 Locked → zdroj je uzamčen

5xx → chyba na straně serveru