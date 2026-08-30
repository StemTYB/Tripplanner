# 🎌 Nippon Liquid Itinerary (NipponIt)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Una aplicación web progresiva (PWA) de diseño **Mobile-First** construida para gestionar y visualizar un viaje de 31 días a través de Japón (Tokio, Osaka, Takayama, Shirakawa-go y el Monte Fuji). 

Diseñada con una estética inmersiva **"Liquid Glass"** que combina el Y2K, luces de neón y glassmorfismo, proporcionando una experiencia de usuario fluida y visualmente impactante mientras recorremos la ciudad.

---

## Características Principales

* **UI/UX "Liquid Glass":** Interfaz translúcida con desenfoque de fondo (`backdrop-blur`), bordes iluminados y fondos de malla degradada animada. Optimizado 100% para uso a una mano en smartphones.
* **Calculadora JPY a MXN:** Conversión rápida de Yenes a Pesos Mexicanos en tiempo real para decisiones de compra rápidas en tiendas de segunda mano, arcades o restaurantes.
* **Gestor de Compras (Thrifting & Merch):** Catálogo visual integrado con soporte para URLs de imágenes externas. Perfecto para cazar figuras, vinilos y ropa retro en Hard-Off, Book-Off o 2nd Street.
* **Registro de Experiencias:** Tarjetas inmersivas con soporte de imágenes y mapas para organizar itinerarios diarios en templos, museos y escenarios urbanos.
* **Sincronización en la Nube:** Backend impulsado por Cloudflare Workers y base de datos D1 para acceso instantáneo y sincronizado del itinerario.

---

## Arquitectura y Tecnologías

El proyecto utiliza un stack moderno y sin servidor (serverless) para garantizar latencia cero y despliegues automáticos:

* **Frontend:** React (JSX) + Vite
* **Estilos:** Tailwind CSS (con configuración customizada para utilidades de glassmorfismo y animaciones fluidas)
* **Backend / API:** Cloudflare Workers (Routing nativo)
* **Base de Datos:** Cloudflare D1 (SQLite distribuido)
* **Hosting:** Cloudflare Pages
* **Control de Versiones & CI/CD:** Git + GitHub Actions (Despliegue automático en cada `push`)

---

## Entorno de Desarrollo Local

Para replicar el entorno de producción localmente sin afectar la base de datos real en la nube, utilizamos el simulador de Wrangler (`Miniflare`).

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TU-USUARIO/TU-REPOSITORIO.git](https://github.com/TU-USUARIO/TU-REPOSITORIO.git)
cd TU-REPOSITORIO
npm install