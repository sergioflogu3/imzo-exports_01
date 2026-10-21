# CLAUDE.md — IMZO Ventas

Aplicación web en Angular para mostrar y vender el catálogo de disfraces y accesorios de IMZO (Halloween, Navidad, personajes…). El objetivo es que un cliente pueda ver los productos con su foto y su precio, y consultar o pedir los que le interesan.

## Stack y estructura

- **Angular 21** (componentes standalone, signals, `@angular/build:application`), **TypeScript 5.9** en modo `strict` y con `strictTemplates`.
- **RxJS 7.8**, **Vitest 4** + jsdom para los tests unitarios y **Prettier 3** para el formato.
- `src/app/`: la raíz de la aplicación (`app.ts`, `app.html`, `app.css`, `app.config.ts`, `app.routes.ts`). De momento solo existe el esqueleto que genera el CLI.
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
npm test             # tests unitarios con Vitest (ng test)
npx prettier --write "src/**/*.{ts,html,css}"   # formatear
```

No hay linter configurado (no existe `ng lint`). Si hace falta uno, pregunta antes de añadirlo.

## Convenciones

- Formato: Prettier (`printWidth: 100`, comillas simples) y `.editorconfig` (2 espacios, UTF-8, salto de línea final).
- Nombres al estilo de Angular 21, sin sufijo `.component`: `producto-card.ts`, `producto-card.html`, `producto-card.css`, y la clase `ProductoCard`. El prefijo del selector es `app-`.
- Componentes standalone con `imports: [...]`. Nada de NgModules.
- Estado con `signal`/`computed`, entradas con `input()`/`output()` y control de flujo nuevo en las plantillas (`@if`, `@for` con `track`). Inyección de dependencias con `inject()`.
- Toda la interfaz (textos y mensajes) va **en español**. Los nombres de dominio también en español (`producto`, `precio`, `categoria`), y los términos técnicos de Angular en inglés.
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

- Planifica antes de tocar código si el cambio afecta a más de un componente, a las rutas, al modelo de datos de producto o a las imágenes.
- Haz cambios pequeños y enfocados, con una funcionalidad cada vez.
- Al terminar, explica qué archivos has cambiado y por qué, cómo probarlo y cualquier suposición que hayas hecho (sobre todo en precios o nombres de producto).

## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `CLAUDE.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Límites

- ✅ **Siempre:** seguir las convenciones de arriba, pasar Prettier a los archivos tocados, mantener el tipado estricto (sin `any`) y comprobar que `npm run build` y `npm test` pasan.
- ⚠️ **Pregunta antes:** añadir dependencias nuevas (librerías de UI, de estado, linter…), crear archivos o carpetas nuevos fuera de `src/app/`, copiar o convertir imágenes a `public/`, cambiar el formato de los datos de producto o los precios, o tocar `angular.json` y los `tsconfig`.
- 🚫 **Nunca:** borrar, mover o renombrar nada en `../primera_salida` ni en `../segunda_salida`, inventar precios, subir fotos o datos a servicios externos, ni hacer commit o push sin que te lo pidan.

## Verificación

1. `npm run build` termina sin errores y sin avisos de presupuesto nuevos.
2. `npm test` pasa entero. Las funciones nuevas con lógica (como sacar el precio del nombre de una carpeta) llevan su `*.spec.ts`.
3. `npm start` y comprobar en `http://localhost:4200` que la pantalla cambiada se ve bien, también en ancho de móvil, y que no hay errores en la consola.
