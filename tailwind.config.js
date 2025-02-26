/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Màu nền cho dark mode và light mode
        darkBackground: '#262626',     // Nền đen cho dark mode
        lightBackground: '#fcf4f4',    // Nền sáng (màu kem) cho light mode

        // Màu chủ đạo
        primary: '#bd8790',            // Màu hồng nhạt chủ đạo

        // Màu phụ và nhấn
        secondary: '#4e4b56',          // Màu xám đậm cho phần văn bản phụ
        accent: '#f5a623',             // Màu vàng cam cho các điểm nhấn

        // Màu cho văn bản
        textLight: '#d8e2dc',          // Màu xám nhạt cho văn bản chính trên nền tối
        textDark: '#262626',           // Màu đen cho văn bản chính trên nền sáng

        // Màu cho các chi tiết khác
        highlight: '#d8e2dc',          // Màu xám nhạt để làm nổi bật các phần tử nhỏ
      },
    },
  },
  darkMode: 'class',
  plugins: [
    require('daisyui'),
  ],
}
