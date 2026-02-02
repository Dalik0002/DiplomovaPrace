
winget install -e --id OpenJS.NodeJS.LTS

npm run dev -- --host

npm install swr


🔹 Nejčastější jednotky velikostí v CSS (a Reactu)
Jednotka	Co to je	Na co se hodí
px	Pixely obrazovky. Absolutní jednotka – vždy stejně velká, nezávisí na rodiči ani rootu.	Když chceš přesné rozměry (ikony, border, přesný spacing).
em	Relativní k aktuální velikosti fontu rodiče. 1em = velikost fontu rodiče.	Když chceš, aby se něco měnilo spolu s textem rodiče.
rem	Relativní k velikosti fontu html (root). 1rem = font-size HTML tagu (default 16px).	Stabilní responzivní design – všude stejná základní jednotka.
%	Procento vzhledem k rodičovskému prvku.	Šířky/sloupce, layouty.
vh	Výška okna prohlížeče (viewport height). 1vh = 1% výšky okna.	Fullscreen sekce, dynamická výška.
vw	Šířka okna prohlížeče (viewport width). 1vw = 1% šířky okna.	Šířka elementů podle obrazovky.
auto	Automatické přizpůsobení podle obsahu/rodiče.	Když nechceš počítat.



💡 Další UX nápady
Responsivita bez scrollování: vše navrženo tak, aby se vešlo na:

Full HD (1920x1080)

iPad landscape (1024x768)

Dark/Light režim

Zvýraznění neúplných sklenic (např. červený rámeček nebo "!" ikona).

Stavová lišta: animace progressu při nalévání + hlášky (např. "Sklenice 3 se právě plní").

🎨 Designové tipy
Barevnost:

Pozadí: tmavě fialová / černá / tmavě modrá

Texty: bílé nebo pastelové


