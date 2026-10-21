# Tareas 001 — Catálogo de productos

Spec: [`spec.md`](spec.md) · Plan: [`plan.md`](plan.md)

- [x] **T1. Modelo `Producto` y orden por precio.** RF-17, RF-18
  - Crear `src/app/datos/producto.ts` y `catalogo.ts` (`ordenarPorPrecioDesc`, `formatearPrecio`, `compararTexto`), con su test. Cambiar `"test"` en `package.json` a `node --test` y borrar `src/app/app.spec.ts`.
  - Hecho cuando: `node --test` está en verde con los casos de `catalogo.test.ts`, y `npm run build` compila un import de `catalogo.ts` desde `app.ts` (lo que comprueba `import type` sin extensión).

- [x] **T2. Análisis de carpetas y fotos.** RF-2, RF-3, RF-4, RF-7, RF-8
  - Crear `scripts/catalogo/carpetas.ts` (`analizarCarpeta`, `nombreVisible`, `esFotoValida`, `ordenarFotos`, `nombreCopia`) con su test.
  - Hecho cuando: `node --test` está en verde con todos los casos límite de carpetas y fotos del plan.

- [x] **T3. Fusión y validación del catálogo.** RF-4, RF-5, RF-6, RF-13, RF-15
  - Crear `scripts/catalogo/fusion.ts` y `validacion.ts` con sus tests.
  - Hecho cuando: `node --test` está en verde con los casos nuevo, existente, quitado, cambio de precio, `50_x` → `55_x` + `60_x`, `calaca` 50/95 y JSON erróneo con su posición.

- [x] **T4. Resumen y medición de copias.** RF-16, RNF-3
  - Crear `scripts/catalogo/resumen.ts` (`esCopiaPesada`, `crearResumen`) con su test.
  - Hecho cuando: `node --test` está en verde con los límites de 300 KB y 1200 px y con un resumen que incluye las 6 categorías.

- [x] **T5. Script de generación con `sips`.** RF-1, RF-9, RF-10, RF-11, RF-12, RF-14, RNF-7
  - Crear `scripts/catalogo/imagenes.ts` y `scripts/generar-catalogo.ts`, el script `"catalogo"` en `package.json` y `/public/fotos/` en `.gitignore`.
  - Hecho cuando: `npm run catalogo` con las carpetas reales da 75 productos, 4 "no disponible" (`cruela`, `grinch`, `harry_potter`, `radioactivo`) y 0 "pesada". Una segunda ejecución no crea ninguna copia. Las sumas de verificación de `../primera_salida` y `../segunda_salida` son iguales antes y después. Renombrar temporalmente una carpeta de origen hace que la generación pare sin tocar nada.

- [x] **T6. Contacto y enlace de WhatsApp.** RF-34
  - Crear `src/app/datos/contacto.ts` (constantes con valores de ejemplo marcados `// PENDIENTE` y `crearEnlaceWhatsapp`) con su test.
  - Hecho cuando: `node --test` está en verde con número con `+` y espacios y mensaje con tildes y `¿?`.

- [x] **T7. Cuadrícula y tarjeta de producto.** RF-17 a RF-21, RF-29, RF-30, RF-31, RNF-1, RNF-4, RNF-6
  - Usar la skill `frontend-design` para la dirección visual. Crear `catalogo/` y `tarjeta-producto/`, y sustituir la plantilla del CLI en `app.html`.
  - Hecho cuando: `npm run build` compila importando `productos.json`. Con Chrome DevTools a 320, 375, 768 y 1280 px se ven 2, 2, 3 y al menos 4 columnas, sin scroll horizontal, con el primer producto a Bs. 380 y el último a Bs. 15. A 375×812 px se piden menos fotos que productos. Una foto rota muestra el recuadro gris.

- [x] **T8. Ventana de detalle.** RF-22 a RF-28, RNF-5
  - Crear `detalle-producto/` con `<dialog>` nativo, foto grande, miniaturas y descripción.
  - Hecho cuando: con Chrome DevTools, al pulsar una tarjeta y al pulsar Enter sobre ella se abre el detalle. Las miniaturas cambian la foto grande. Escape, "Cerrar" y pulsar fuera lo cierran y el foco vuelve a la tarjeta. La página de detrás no se mueve. Una descripción vacía no muestra el bloque, y una con saltos de línea los respeta. Las fotos secundarias solo se piden al abrir el detalle.

- [x] **T9. Pie de página y botón de WhatsApp.** RF-32 a RF-35, RNF-1, RNF-2
  - Crear `pie-pagina/` y `boton-whatsapp/` con iconos SVG propios, y poner los valores reales en `contacto.ts`.
  - Hecho cuando: con Chrome DevTools, el botón de WhatsApp se ve siempre (también con el detalle abierto) y abre `wa.me` con el número y el mensaje reales. Al final de la página no tapa la última fila ni los enlaces. Facebook y TikTok se abren en una pestaña nueva. La pestaña de red no muestra peticiones a otros dominios, y no hay cookies ni almacenamiento.

- [x] **T10. Logo y cabecera centrados.** RF-36
  - Mostrar el logo (o "IMZO" si no hay) al inicio de `app.html`, centrado, con título y bajada también centrados.
  - Hecho cuando: con Chrome a 375 y 1280 px, el logo se ve centrado con 120 px de alto como máximo, el título y la bajada están centrados, no hay scroll horizontal y la consola está limpia.
