# Family Movie Watchlist API

[ English ](README.md) | [ Español ](README.es.md)

Una API HTTP para gestionar listas familiares de películas, construida con Node.js, Express, JWT y bcryptjs, y organizada con una pequeña arquitectura basada en clases (`AuthService` y `MovieInput`). Diseñada específicamente para cumplir con los requisitos de freeCodeCamp y completamente probada mediante Jest y Supertest.

---

## Características

- **Arquitectura Limpia:** Separa configuración, autenticación, validación, rutas HTTP y manejo de errores en módulos con responsabilidades claras.
- **Autenticación JWT:** El login emite un token firmado; las rutas protegidas verifican firma, expiración y algoritmo.
- **Autorización por Roles:** Los usuarios `parent` pueden modificar cualquier watchlist; los `child` solo la suya. Cualquier usuario autenticado puede leer cualquier watchlist, como exige el laboratorio.
- **Contraseñas Seguras:** Las contraseñas se comparan con bcrypt; no existe un fallback de contraseña en texto plano.
- **Sanitización de Entrada:** Los títulos y géneros se recortan, se eliminan sus caracteres de control y se limitan en longitud. Solo se aceptan campos permitidos.
- **Errores JSON Consistentes:** JSON inválido, IDs inválidos, errores de validación y fallos inesperados devuelven respuestas JSON.
- **Configurable:** El puerto, el secreto JWT y la duración del token se pueden definir con variables de entorno o un fichero `.env`.
- **Pruebas Automatizadas:** Pruebas unitarias de middleware, servicios y validación, además de pruebas de integración de la API HTTP.
- **Persistencia en JSON:** Usa `utils/db.js` y los ficheros de `data/` proporcionados por freeCodeCamp; no requiere base de datos.

---

## Instalación

Para configurar el proyecto localmente, asegúrate de tener [Node.js](https://nodejs.org/) instalado (se recomienda Node.js 20.11 o superior), luego clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/imalescript/fcc-back-end-development.git
cd 05-family-movie-watchlist-api
npm install
```

Crea tu fichero de entorno local:

```bash
cp .env.example .env
```

Para iniciar el servidor:

```bash
npm start
```

La API se ejecuta en `http://localhost:3000`.

> **Nota:** freeCodeCamp ejecuta su propia suite de tests contra un servidor en marcha. Arranca el proyecto con `npm start` antes de pulsar **Run Tests**.

---

## Configuración

Copia `.env.example` a `.env` y ajusta los valores:

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto en el que escucha el servidor. |
| `JWT_SECRET` | `your_jwt_secret` | Secreto usado para firmar y verificar los JWT. Usa un valor largo y aleatorio en producción. |
| `TOKEN_TTL` | `1h` | Duración de los tokens emitidos (por ejemplo `15m`, `1h`, `7d`). |

Las variables de entorno reales siempre tienen prioridad sobre las definidas en el fichero `.env`:

```bash
PORT=4000 JWT_SECRET=my-secret npm start
```

Si falta `JWT_SECRET`, el servidor usa un valor de respaldo de desarrollo e imprime un aviso. Define siempre un secreto fuerte fuera del entorno local.

---

## Autenticación

Todas las rutas de watchlist requieren un token Bearer:

```http
Authorization: Bearer <token>
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "dad_miller",
  "password": "parent456"
}
```

Respuesta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Los datos semilla incluyen estas cuentas de prueba:

| Usuario | Contraseña | Rol |
|---|---|---|
| `dad_miller` | `parent456` | `parent` |
| `mom_miller` | `parent123` | `parent` |
| `jake_miller` | `child123` | `child` |
| `sophie_miller` | `child456` | `child` |

---

## API

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/` | Público | Devuelve el nombre de la API. |
| `POST` | `/api/auth/login` | Público | Devuelve un JWT para credenciales válidas. |
| `GET` | `/api/watchlist/:userId` | Cualquier usuario autenticado | Devuelve la watchlist de ese usuario. |
| `POST` | `/api/watchlist/:userId/movies` | `parent`, o `child` para su propia lista | Añade una película. |
| `PUT` | `/api/watchlist/:userId/movies/:movieId` | `parent`, o `child` para su propia lista | Actualiza una película. |
| `DELETE` | `/api/watchlist/:userId/movies/:movieId` | `parent`, o `child` para su propia lista | Elimina una película. |

### Leer una watchlist

```bash
curl http://localhost:3000/api/watchlist/1 \
  -H "Authorization: Bearer <token>"
```

```json
[
  {
    "id": 1,
    "title": "The Dark Knight",
    "genre": "Action",
    "watched": true
  }
]
```

### Añadir una película

```bash
curl -X POST http://localhost:3000/api/watchlist/3/movies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","genre":"Sci-Fi"}'
```

`title` es obligatorio. `genre` es opcional. Las películas nuevas se crean con `watched: false`.

### Actualizar una película

```bash
curl -X PUT http://localhost:3000/api/watchlist/3/movies/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"watched":true}'
```

Campos aceptados: `title`, `genre` y `watched`. Los campos desconocidos se ignoran.

### Eliminar una película

```bash
curl -X DELETE http://localhost:3000/api/watchlist/3/movies/2 \
  -H "Authorization: Bearer <token>"
```

---

## Validación y errores

- `title` debe ser una cadena de texto no vacía de 200 caracteres como máximo.
- `genre`, si se envía, debe ser una cadena de texto no vacía de 80 caracteres como máximo.
- `watched`, si se envía en una actualización, debe ser booleano.
- Los IDs deben ser enteros positivos.
- El cuerpo de las peticiones está limitado a 10kb.
- Los campos desconocidos se ignoran, así que un cliente no puede asignar propiedades arbitrarias.

| Estado | Significado |
|---|---|
| `400` | Credenciales ausentes, cuerpo inválido, ID inválido o JSON mal formado. |
| `401` | Token ausente, mal formado, inválido o expirado; login inválido. |
| `403` | El usuario autenticado no puede modificar esa watchlist. |
| `404` | Usuario, película o ruta no encontrados. |
| `413` | El cuerpo supera el límite de 10kb. |

Errores comunes:

```json
{ "error": "No token provided." }
{ "error": "Invalid or expired token." }
{ "error": "Access denied" }
{ "error": "Invalid credentials." }
```

---

## Estructura del proyecto

```
05-family-movie-watchlist-api/
├── app.js                  # App Express: middleware, rutas y manejo de errores
├── index.js                # Punto de entrada: inicia el servidor HTTP
├── config.js               # Configuración por variables de entorno
├── jest.config.cjs         # Configuración de Jest
├── middleware/
│   ├── authenticate.js     # Verifica el token Bearer y crea req.user
│   ├── authorize.js        # Reglas de autorización parent/child
│   └── error-handler.js    # 404 JSON y manejador central de errores
├── routes/
│   ├── auth.js             # POST /api/auth/login
│   └── watchlist.js        # Rutas CRUD de la watchlist
├── services/
│   └── auth-service.js     # AuthService: comparación bcrypt y firma JWT
├── utils/
│   ├── db.js               # Helpers de persistencia JSON de freeCodeCamp
│   └── movie-input.js      # MovieInput: validación, sanitización y parseId
├── tests/
│   ├── setup.js            # Variables de entorno para tests
│   ├── unit/
│   │   ├── authenticate.test.js
│   │   ├── authorize.test.js
│   │   ├── auth-service.test.js
│   │   ├── error-handler.test.js
│   │   └── movie-input.test.js
│   └── integration/
│       └── api.test.js
├── data/
│   ├── users.json          # Usuarios semilla
│   └── watchlists.json     # Watchlists semilla
├── .env.example            # Plantilla de configuración
├── .gitignore
└── package.json
```

---

## Pruebas

Este proyecto incluye pruebas unitarias escritas en Jest para el middleware, el servicio de autenticación, la validación de películas y el manejador de errores, además de pruebas de integración escritas en Jest y Supertest para la API HTTP.

Para ejecutar la suite de pruebas, ejecuta:

```bash
npm test
```

Para ejecutar la suite en modo watch:

```bash
npm run test:watch
```

Para ejecutar la suite con un reporte de cobertura:

```bash
npm run test:coverage
```

Las pruebas de integración usan directamente la app Express exportada, así que no necesitan un servidor en marcha. Guardan una copia de `data/watchlists.json` antes de la suite y la restauran después de cada prueba, manteniendo intactos los datos semilla.

La suite actual contiene 90 pruebas en 6 suites.

---

## Créditos

Proyecto desarrollado como parte de la certificación Back End Development and APIs de freeCodeCamp. Los datos semilla y `utils/db.js` son proporcionados por freeCodeCamp.
