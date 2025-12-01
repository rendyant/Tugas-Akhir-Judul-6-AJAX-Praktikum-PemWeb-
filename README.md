from pathlib import Path

content = """# 🎉 Qweather — Website Dashboard Cuaca Modern (Indonesia Only)

Qweather adalah website dashboard cuaca yang dirancang untuk menampilkan informasi cuaca real-time secara akurat untuk kota-kota di Indonesia. Tampilan modern, mode gelap/terang, serta fitur pencarian kota membuat aplikasi ini nyaman digunakan baik di laptop maupun perangkat mobile.

---

## 🌗 Tampilan Website

### 🔥 Dark Mode
![Dark Mode](darkmode.png)

### ☀️ Light Mode
![Light Mode](lightmode.png)

---

## ✨ Fitur Utama

- 🔍 **Pencarian kota Indonesia** menggunakan Geocoding API  
- 🌡️ **Cuaca real-time** (suhu, kelembaban, angin, tekanan udara)  
- ☔ **Prakiraan cuaca 5 hari ke depan**  
- ⭐ **Favoritkan kota** untuk akses cepat  
- 🔁 **Konversi suhu otomatis (°C ↔ °F)**  
- 🌙/☀️ **Dark Mode & Light Mode**  
- 🗂️ **LocalStorage** untuk menyimpan data favorit  
- ⚡ UI smooth, minimalis, dan responsif  

---

## 🛠️ Teknologi yang Digunakan

Website ini dibuat menggunakan teknologi web standar tanpa framework berat, sehingga loading cepat dan mudah untuk dikembangkan:

- **HTML5** — struktur halaman  
- **CSS3** — style modern + gradient + animasi  
- **JavaScript (Vanilla)** — logika aplikasi  
- **Open-Meteo Weather API** — data cuaca real-time  
- **Open-Meteo Geocoding API** — pencarian kota Indonesia  
- **LocalStorage** — penyimpanan favorit  
- Tanpa backend, sehingga bisa di-hosting di platform static hosting seperti Netlify/Vercel/GitHub Pages.

---

## 🚀 Cara Menjalankan

1. Download atau clone project ini.  
2. Pastikan file `index.html`, `style.css`, dan `script.js` berada dalam satu folder.  
3. Buka **index.html** melalui browser favoritmu.  
4. Selesai — website berjalan tanpa instalasi tambahan.

Untuk hosting:
- Upload folder ke **Netlify**, **Vercel**, atau **GitHub Pages**.

---

## 🧠 Tentang Proyek

Qweather dibuat untuk menghadirkan pengalaman membaca cuaca yang:

- Minimalis  
- Cepat  
- Akurat  
- Fokus pada kota-kota Indonesia  

Tujuan utamanya adalah membuat aplikasi cuaca yang mudah dipakai sehari-hari, dengan tampilan estetik dan informatif.

---

## 💛 Kredit
Didesain & dikembangkan oleh **Rendy Antono**.

Feel free untuk mengembangkan, memodifikasi, atau menjadikannya dasar project lain.

"""

Path("/mnt/data/README.md").write_text(content, encoding="utf-8")
"/mnt/data/README.md created"
