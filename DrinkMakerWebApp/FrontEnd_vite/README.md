# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


npm run dev -- --host


🧃 DrinkMaker – Alternativní moderní rozložení (bez scrollu)
📱 Full-screen UI s horizontálním tokem

┌────────────────────────────── DrinkMaker ───────────────────────────────┐
│  🟣 Logo (malé vlevo)            📦 Setup        ⚙️ Nastavení           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   🍹 Sklenice 1     🍹 Sklenice 2     🍹 Sklenice 3     🍹 Sklenice 4   │
│   [ Rum + Cola ]   [ Gin + Tonic ]   [ Nezadáno ]   [ Jack + Cola ]    │
│                                                                         │
│   🍹 Sklenice 5     🍹 Sklenice 6     ⏱ Fronta: 3 objednávky           │
│   [ Nezadáno ]      [ Vodka ]                                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                    🔘 ▶️ [ Spustit nalévání ] 🔘                        │
└─────────────────────────────────────────────────────────────────────────┘

Detailnější popis komponent
Horní lišta (TopBar):

Vlevo malé logo DrinkMaker.

Vpravo tlačítka: 📦 Setup (výběr dostupných ingrediencí), ⚙️ Nastavení (pro administraci, UART, testy atd.).

Střední sekce (Drink Grid):

Dvě řady po třech "sklenicích".

Každá má název a přiřazené ingredience.

Kliknutí otevře modální okno pro výběr ingrediencí (dropdown / drag & drop).

Poslední box ukazuje stav fronty.

Spodní lišta (BottomBar):

Velké tlačítko pro spuštění procesu – designované jako CTA (call-to-action).

Může být doprovázeno animací/efektem.

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

Sklenice jako “karty” – lehce vystouplé s rounded corner a drop shadow

Styl tlačítek:

Velká, snadno kliknutelná (min. 44px výška)

Ikona + text

Hover/active efekty

⚙️ Tech Stack doporučení
React + Vite

Tailwind CSS (rychlý vývoj moderního UI)

Framer Motion pro animace

Recoil/Zustand pro stav (pokud bude složitější sdílení dat)

Modální komponenty pro výběr ingrediencí (např. Radix UI, nebo custom)

