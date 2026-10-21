# CLAUDE.md — IMZO Ventas

Catálogo web minimalista de disfraces y accesorios de IMZO (Halloween, Navidad, personajes…). Lista los productos (nombre, precio, detalle y fotos) ordenados estrictamente del más caro al más barato, con un botón directo a WhatsApp para consultar. Sin login ni backend.

## Reglas

- Lee [`docs/constitution.md`](docs/constitution.md) y la spec activa (`specs/NNN-*/`) antes de tocar código. Los 6 principios de la constitución son innegociables y prevalecen sobre este archivo.

## Stack y estructura

- **Angular 21** (componentes standalone, signals, `@angular/build:application`), **TypeScript 5.9** en modo `strict` y con `strictTemplates`.
- **RxJS 7.8**, el runner nativo de **Node 24** (`node --test`) para los tests y **Prettier 3** para el formato. Vitest y jsdom siguen en `package.json` porque los instala el CLI, pero no se usan.
- `src/app/`: la raíz de la aplicación (`app.ts`, `app.html`, `app.css`, `app.config.ts`, `app.routes.ts`). De momento solo existe el esqueleto que genera el CLI.
- `docs/`: la constitución (`constitution.md`).
- `specs/NNN-<nombre>/`: una carpeta por spec, numerada (`001-listado-productos/`, `002-…`). La spec activa es la de la tarea en curso y se escribe antes que el código (principio 2).
- `public/`: los archivos estáticos que se sirven tal cual (favicon e imágenes). **Solo lo que esté aquí** llega al build.
- `.vscode/mcp.json`: el servidor MCP del Angular CLI (`npx @angular/cli mcp`).
- Datos de producto, **fuera del repo**, en la carpeta padre (`../`):
  - `../primera_salida/<producto>/`: las fotos de la primera tanda, sin precio.
  - `../segunda_salida/<precio>_<producto>/`: las fotos de la segunda tanda. El prefijo numérico de la carpeta es el **precio** (p. ej. `90_mario`, `350_grinch`). Hay una foto real (`<precio>_WhatsApp Image ….jpeg`) y varias generadas (`Gemini_Generated_Image_….jpeg`).

## Comandos

Todos se ejecutan desde `imzo_venta/`:

```bash
npm install          # instalar dependencias
npm start            # ng serve → http://localhost:4200
npm run build        # build de producción en dist/
npm run watch        # build de desarrollo en modo watch
npx prettier --write "src/**/*.{ts,html,css}"   # formatear
```

- Tests: `node --test`

Sobre los tests:

- `node --test` usa el runner nativo de Node (`node:test` + `node:assert/strict`) y ejecuta los TypeScript directamente, sin compilar.
- Los archivos de test se llaman `*.test.ts` y van junto a lo que prueban (`src/app/datos/orden.test.ts`). Los `*.spec.ts` no los encuentra.
- Los imports relativos llevan la extensión `.ts` (`import { ordenar } from './orden.ts';`). Sin ella, Node da `ERR_MODULE_NOT_FOUND`.
- Node solo elimina los tipos, así que no se pueden usar `enum`, `namespace` ni propiedades en el constructor. Por eso se testea solo la lógica de datos en `.ts` puro, sin Angular.

No hay linter configurado (no existe `ng lint`). Si hace falta uno, pregunta antes de añadirlo.

## Convenciones

- Formato: Prettier (`printWidth: 100`, comillas simples) y `.editorconfig` (2 espacios, UTF-8, salto de línea final).
- Nombres al estilo de Angular 21, sin sufijo `.component`: `tarjeta-producto.ts`, `tarjeta-producto.html`, `tarjeta-producto.css`, y la clase `TarjetaProducto`. El prefijo del selector es `app-`.
- Componentes standalone con `imports: [...]`. Nada de NgModules.
- Estado con `signal`/`computed`, entradas con `input()`/`output()` y control de flujo nuevo en las plantillas (`@if`, `@for` con `track`). Inyección de dependencias con `inject()`.
- **Todo en español** (principio 6): identificadores propios (clases, funciones, variables, archivos), comentarios, textos visibles, commits y documentación. Ejemplos: `CatalogoServicio`, `ordenarPorPrecioDesc()`, `enlaceWhatsapp`. Solo las APIs de Angular y de la plataforma conservan su nombre (`signal`, `inject`, `ngOnInit`…).
- **Datos separados de la vista** (principio 3): el catálogo, el orden y el enlace de WhatsApp van en archivos `.ts` puros, sin imports de Angular (p. ej. `src/app/datos/`). Los componentes solo pintan lo que reciben.
- Comentarios en español, breves y solo cuando aporten algo.
- Archivo de referencia para el estilo: `src/app/app.ts` y `src/app/app.config.ts`.

## Reglas de dominio / trampas conocidas

- **El precio sale del nombre de la carpeta** en `segunda_salida` (el número antes del primer `_`). La moneda no está indicada: no la supongas, pregunta.
- En `primera_salida` las carpetas **no tienen precio**: no inventes uno.
- Algunos nombres tienen erratas o son coloquiales (`geurrera`, `calabera`, `harry_poter_2`, `winchas`). Para mostrarlos al cliente hay que limpiarlos, pero **no se renombran las carpetas originales** sin permiso.
- Hay productos con el mismo nombre y distinto precio (`50_calaca` / `95_calaca`, `45_mascara` / `50_mascara`): son productos distintos y no se deben fusionar.
- Las fotos están fuera de `public/`, así que Angular no las sirve. Para usarlas hay que copiarlas u optimizarlas dentro de `public/` (y eso conviene preguntarlo primero).
- Las imágenes pesan mucho. Ojo con el presupuesto de build: 500 kB de aviso en el bundle inicial y 4 kB de aviso por cada CSS de componente.
- Los nombres de archivo llevan espacios (`WhatsApp Image 2026-10-17 at 21.34.57.jpeg`), así que en las URLs hay que codificarlos.

## Forma de trabajar

- Si el cambio añade o modifica un comportamiento, actualiza primero la spec activa en `specs/NNN-*/` y después el código, en el mismo cambio (principio 2).
- Planifica antes de tocar código si el cambio afecta a más de un componente, a las rutas, al modelo de datos de producto o a las imágenes.
- Haz cambios pequeños y enfocados, con una funcionalidad cada vez.
- Al terminar, explica qué archivos has cambiado y por qué, cómo probarlo y cualquier suposición que hayas hecho (sobre todo en precios o nombres de producto).

## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `CLAUDE.md` (o a `docs/constitution.md` si es un principio) en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Límites

- ✅ **Siempre:** cumplir `docs/constitution.md`, seguir las convenciones de arriba, pasar Prettier a los archivos tocados, mantener el tipado estricto (sin `any`) y comprobar que `npm run build` y `node --test` pasan.
- ⚠️ **Pregunta antes:** añadir dependencias nuevas (librerías de UI, de estado, linter…), crear archivos o carpetas nuevos fuera de `src/app/`, copiar o convertir imágenes a `public/`, cambiar el formato de los datos de producto o los precios, o tocar `angular.json` y los `tsconfig`.
- 🚫 **Nunca:** borrar, mover o renombrar nada en `../primera_salida` ni en `../segunda_salida`, inventar precios, subir fotos o datos a servicios externos, añadir login, backend, cookies, analítica o servicios de terceros, recoger datos personales del visitante, cambiar la constitución sin aprobación explícita, ni hacer commit o push sin que te lo pidan.

## Verificación

1. `npm run build` termina sin errores y sin avisos de presupuesto nuevos.
2. `node --test` pasa entero. Toda la lógica de datos (orden por precio, precios, enlace de WhatsApp) tiene su `*.test.ts` (principio 4).
3. El código y la spec activa de `specs/NNN-*/` describen lo mismo, y el listado sale ordenado del más caro al más barato.
4. Con `npm start` en marcha, revisar `http://localhost:4200` con el MCP de **Chrome DevTools** (`chrome-devtools`):
   - Hacer una captura de la pantalla cambiada en escritorio y en ancho de móvil (~375 px) y comprobar que se ve bien.
   - Revisar la consola: ningún error ni aviso nuevo.
   - Revisar la red: ninguna petición fallida (404 de imágenes incluidos) y fotos con un peso razonable.
   - Si el MCP no está disponible, dilo y pide que se revise a mano en el navegador.
