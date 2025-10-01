// tailwind.config.js
module.exports = {
    content: ["./index.html", "./gallery.html", "./contact.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [],
    safelist: [
        'fixed',
        'inset-0',
        'z-[9999]',
        'hidden',
        'flex',
        'items-center',
        'justify-center'
    ]
}
