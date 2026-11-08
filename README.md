# Sorpresa Bebé — Backend (Vercel, gratis)

Backend serverless para la página de GitHub Pages
https://dvrdirect.github.io/test96/ — guarda votos, cartas y
suscripciones en MongoDB Atlas (la Data API de Atlas está retirada,
por eso la página ya no habla directo con Atlas, sino con este backend).

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
| POST | `/api/subscriptions` | `{ channel: "whatsapp"\|"email", contact }` | suscripción creada (201) |

CORS: solo permite el origen `https://dvrdirect.github.io`.
Sin autenticación: son datos públicos de la familia. No se guardan
contraseñas, CLABEs ni datos privados.

## Despliegue (pasos)

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

## Probar

```bash
curl https://<project>.vercel.app/api/votes
curl -X POST https://<project>.vercel.app/api/votes \
  -H "Content-Type: application/json" \
  -d '{"name":"Prueba","sex":"nina","voter":"Daniel"}'
```

## Desarrollo local (opcional)

```bash
npm install
# crea .env con MONGODB_URI=... (nunca se sube, está en .gitignore)
npx vercel dev
```
