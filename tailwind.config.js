/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 添加这行
  ],
  theme: {
    extend: {
      borderWidth: {
        '0.5': '0.5px',
      }
    }
  },
  plugins: [],
}
