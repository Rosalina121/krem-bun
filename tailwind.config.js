/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./frontend/index.html",
        "./frontend/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            dropShadow: {
                sims: "0 0 0.2rem rgba(0, 0, 0, 0.7)",
            },
        },
    },
    plugins: [],
}
