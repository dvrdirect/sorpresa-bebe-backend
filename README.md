# Sorpresa Bebé — Backend (Vercel o Render, gratis)

Backend para la página de GitHub Pages
https://dvrdirect.github.io/test96/ — guarda votos, cartas y
suscripciones en MongoDB Atlas (la Data API de Atlas está retirada,
por eso la página ya no habla directo con Atlas, sino con este backend).

Hay dos formas de correrlo, con el mismo código y las mismas rutas:
- **Vercel** (serverless, `api/*.js`) — ver "Despliegue en Vercel".
- **Render** (servidor Express, `server.js`) — ver "Despliegue en Render".
  Se añadió porque la verificación por SMS de Vercel quedó bloqueada
  12 horas. Los archivos de Vercel (`api/`, `vercel.json`) no se tocaron.

Base de datos (ya creada en Atlas):
- Proyecto: `sorpresa-bebe` · Cluster: `Cluster0` (M0 gratis)
- Base: `sorpresa_bebe`
- Colecciones: `votes`, `letters`, `subscriptions`

## Endpoints

Base: `https://<project>.vercel.app`

| Método | Ruta | Body (POST) | Respuesta |
|---|---|---|---|
| GET | `/api/votes` | — | lista de votos (máx. 500) |
| POST | `/api/votes` | `{ name, sex: "nino"\|"nina", voter? }` | voto creado (201) |
| GET | `/api/letters` | — | lista de cartas (máx. 500) |
| POST | `/api/letters` | `{ author?, message }` | carta creada (201) |
| GET | `/api/subscriptions` | — | lista de suscripciones (máx. 500) |
| POST | `/api/subscriptions` | `{ channel: "whatsapp"\|"email", contact, name? }` | suscripción creada (201) |
| PATCH | `/api/subscriptions/:id` | `{ name }` | nombre actualizado en una suscripción existente |

CORS: solo permite el origen `https://dvrdirect.github.io`.
Sin autenticación: son datos públicos de la familia. No se guardan
contraseñas, CLABEs ni datos privados.

## Despliegue en Vercel (pasos)

1. **Sube este proyecto a GitHub** (repo nuevo, p. ej. `sorpresa-bebe-backend`).
   No subas ningún archivo `.env` — la contraseña **nunca** va en el repo.
2. **En Vercel** (https://vercel.com, entra con GitHub):
   Add New → Project → Importa el repo `sorpresa-bebe-backend` → Deploy.
   El plan Hobby (gratis) es suficiente.
3. **Variable de entorno** (en Vercel: Project → Settings → Environment Variables):
   - Nombre: `MONGODB_URI`
   - Valor: la cadena de conexión de Atlas, con la contraseña del
     usuario `dvrdirect_db_user`:
     `mongodb+srv://dvrdirect_db_user:<password>@cluster0.<host>/sorpresa_bebe`
     Consíguela en Atlas → Database → Connect → Drivers (o en
     Database Access si hay que resetear la contraseña del usuario).
     ⚠️ La contraseña solo se muestra una vez en Atlas; guárdala
     en Vercel, no en ningún archivo del repo.
   - Marca los 3 entornos (Production, Preview, Development) y
     **Redeploy** el proyecto para que tome la variable.
4. **Anota la URL** que te da Vercel, p. ej. `https://sorpresa-bebe-backend.vercel.app`
5. **Conéctala en la página**: en el repo `test96` (GitHub Pages),
   edita `config.js` y pon:
   ```js
   BACKEND_URL: "https://sorpresa-bebe-backend.vercel.app"
   ```
   (sin `/` al final). Vuelve a subir `config.js` y `script.js`.
   Si `BACKEND_URL` queda vacío, la página sigue funcionando en
   modo local (localStorage), sin resultados compartidos.

## Despliegue en Render (pasos)

1. **Sube este proyecto a GitHub** (el mismo repo `sorpresa-bebe-backend`,
   que ya tiene los archivos de Vercel). No subas ningún `.env`.
2. **En Render** (https://render.com, entra con GitHub):
   New → Web Service → selecciona el repo `sorpresa-bebe-backend`.
   - Runtime: Node · Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: **Free**. O usa el Blueprint de `render.yaml` (New → Blueprint).
3. **Variable de entorno** (en Render: Service → Environment):
   - Nombre: `MONGODB_URI`
   - Valor: la cadena de conexión de Atlas, con la contraseña del
     usuario `dvrdirect_db_user`:
     `mongodb+srv://dvrdirect_db_user:<password>@cluster0.msv7q39.mongodb.net/sorpresa_bebe`
     ⚠️ La contraseña solo se muestra una vez en Atlas (Database Access);
     si se perdió, hay que resetearla ahí antes de desplegar.
     Render hace Deploy automático al guardar la variable.
4. **Anota la URL** que te da Render, p. ej.
   `https://sorpresa-bebe-backend.onrender.com`
5. **Conéctala en la página**: en el repo `test96` (GitHub Pages),
   edita `config.js` y pon:
   ```js
   BACKEND_URL: "https://sorpresa-bebe-backend.onrender.com"
   ```
   (sin `/` al final). Vuelve a subir `config.js` y `script.js`.

   ⚠️ **Plan gratis de Render: la instancia se apaga tras ~15 min sin
   tráfico y la primera petición puede tardar ~30–60 s en despertar.**
   Las siguientes peticiones ya son rápidas. Si la página tarda en
   cargar los votos la primera vez, es eso, no un error.

## Probar

```bash
curl https://<project>.vercel.app/api/votes
curl -X POST https://<project>.vercel.app/api/votes \
  -H "Content-Type: application/json" \
  -d '{"name":"Prueba","sex":"nina","voter":"Daniel"}'
```

En Render es igual, cambiando la base por la URL de Render, p. ej.:
`curl https://sorpresa-bebe-backend.onrender.com/api/votes`
(la primera llamada puede tardar ~30–60 s si la instancia estaba dormida).

## Desarrollo local (opcional)

```bash
npm install
# crea .env con MONGODB_URI=... (nunca se sube, está en .gitignore)
npx vercel dev        # versión Vercel
node server.js       # versión Render (Express, puerto 3000)
```
