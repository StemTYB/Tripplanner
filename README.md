# Trip Planner — Cloudflare (Workers + D1)

Mismo frontend de siempre (React + Vite + Tailwind). Lo que cambió respecto a la versión "VPS" es el backend:

| | Versión VPS | Versión Cloudflare (esta) |
|---|---|---|
| API | Express (Node) | [Hono](https://hono.dev) corriendo como Worker |
| Base de datos | SQLite local (`better-sqlite3`) | **D1** — SQLite administrado por Cloudflare |
| Hosting | tu propio servidor / Docker | Workers (serverless, sin servidor que mantener) |

Todo — frontend + API — se despliega como **un solo Worker**: los archivos estáticos (`dist/`) se sirven vía el binding `ASSETS`, y `/api/*` lo maneja el Worker con D1. No hay nada más que administrar; Cloudflare se encarga de que esté arriba.

Probé el flujo completo en local (migración, servidor, crear/editar/borrar contra D1) antes de dártelo — funciona.

## Estructura

```
├── src/                 → frontend (idéntico al de siempre)
│   ├── App.jsx
│   ├── api.js
│   └── main.jsx
├── worker/index.js       → API (Hono) + sirve los assets
├── migrations/0001_init.sql  → schema + tu viaje a Japón como datos de ejemplo
└── wrangler.toml          → configuración de Cloudflare
```

## 1. Requisitos

- [Node.js](https://nodejs.org) 18+
- Una cuenta de Cloudflare (gratis): https://dash.cloudflare.com/sign-up

```bash
npm install
```

## 2. Desarrollo local (sin tocar Cloudflare todavía)

```bash
npm run db:migrate:local   # crea la base D1 local y la llena con el viaje de ejemplo
npm run dev                 # levanta Vite (frontend, con hot reload) + wrangler dev (API)
```

Abre `http://localhost:5173`. Todo corre emulado en tu máquina (Miniflare) — no necesitas estar logueado a Cloudflare para este paso.

## 3. Desplegar de verdad

### a) Login

```bash
npx wrangler login
```
Abre el navegador, autoriza, listo.

### b) Crear la base de datos D1

```bash
npx wrangler d1 create trip-planner-db
```

Esto imprime algo como:
```toml
[[d1_databases]]
binding = "DB"
database_name = "trip-planner-db"
database_id = "8a3f2c1e-....-...."
```

Copia ese `database_id` y pégalo en `wrangler.toml`, reemplazando `PON_AQUI_TU_DATABASE_ID`.

### c) Correr la migración contra la base real (remota)

```bash
npm run db:migrate:remote
```

Esto crea las tablas y carga tu viaje a Japón de ejemplo en la base de datos de producción.

### d) Deploy

```bash
npm run deploy
```

(esto corre `vite build` y luego `wrangler deploy`). Al terminar te da la URL pública, algo como `https://trip-planner.<tu-usuario>.workers.dev`.

## 4. Dominio propio (opcional)

En el dashboard de Cloudflare → tu Worker → **Settings → Domains & Routes** → agrega tu dominio (si ya lo tienes en Cloudflare) o un subdominio tipo `viaje.tudominio.com`. El certificado HTTPS lo maneja Cloudflare solo.

## Actualizar la app después de hacer cambios

```bash
npm run deploy
```

Eso vuelve a construir el frontend y sube la nueva versión. **No borra tus datos** — la base D1 vive separada del código.

Si en el futuro agregas un campo nuevo a alguna entidad (como pasó con `accessCode`/`accessInfo` en alojamientos), no necesitas tocar el schema SQL: cada fila guarda el objeto completo como JSON en la columna `payload`, así que el frontend simplemente empieza a mandar el campo nuevo y ya.

## Ver / respaldar tus datos

```bash
npx wrangler d1 execute trip-planner-db --remote --command="SELECT * FROM notes"
```

Para un respaldo completo:
```bash
npx wrangler d1 export trip-planner-db --remote --output=respaldo.sql
```

## Costos

Cloudflare Workers y D1 tienen capa gratuita (100,000 peticiones/día en Workers, 5GB + 5 millones de lecturas/día en D1). Para un viaje personal jamás la vas a rozar.

## Siguientes pasos posibles

- **Contraseña:** agregar un middleware de Hono con Basic Auth (`c.req.header('Authorization')`) al inicio de `worker/index.js` si la vas a compartir el link.
- **Mapa real / Google Places / API de vuelos:** el frontend ya trae los campos listos (`coords` en destinos, estructura de `places`, `carrier`/horarios en transportes).
- **Multiusuario:** hoy es una sola "bolsa" de datos (una fila en `trip`). Para varios viajes/usuarios se agregaría una tabla `users` + una columna `trip_id` en cada tabla — la forma de la API cambia poco.
