// file: tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
theme: {
extend: {
colors: {
drinkPurple: "#28092b",
},
borderRadius: {
'2xl': '1rem',
},
},
},
plugins: [],
};