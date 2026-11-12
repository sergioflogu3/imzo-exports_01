# Tareas 003 — Pestañas Navidad y Disfraces

Spec: [`spec.md`](spec.md) (aprobada) · Plan: [`plan.md`](plan.md) (aprobado) · Tareas: aprobadas.

Cada tarea se hace con los tests primero (en rojo) y termina con `node --test` en verde y Prettier pasado a los archivos tocados. Las tareas de interfaz terminan además con `npm run build` sin errores ni avisos de presupuesto nuevos.

## Lógica de datos (`src/app/datos/secciones.ts`, `.ts` puro)

- [x] **T1. Secciones, orígenes y productos de una sección.** RF-2, RF-4, RF-9, RNF-3, RNF-4
  - Crear `secciones.ts` con `Seccion`, `SECCIONES`, `ORIGENES`, `seccionDeOrigen()` y `productosDeSeccion()` (solo `import type` de `producto.ts`), y `secciones.test.ts` con sus tests.
  - Hecho cuando: los tests comprueban que `primera_salida` y `segunda_salida` dan `disfraces`, `tercera_salida` da `navidad` y un origen desconocido da `null`; que `ORIGENES` son exactamente las tres carpetas; que `SECCIONES` va en orden Navidad, Disfraces; que `productosDeSeccion` conserva el orden recibido, no modifica la lista, pone un `350_grinch` de `segunda_salida` y otro de `tercera_salida` cada uno en su sección y mantiene las tres "Sorpresas navideñas" (8, 40 y 45). `node --test` en verde.

- [x] **T2. Recuento, teclado y búsqueda dentro de la sección.** RF-3, RF-8, RF-11, RF-12, RF-14, RF-15, RF-17
  - Añadir `contarPorSeccion()` y `pestanaSiguiente()` con sus tests, y tests de la combinación `buscar(productosDeSeccion(…), texto)` que usará `Catalogo` (el test puede importar los dos archivos con extensión `.ts`).
  - Hecho cuando: los tests comprueban que `contarPorSeccion` cuenta por sección, suma el total, ignora orígenes desconocidos y da `{ navidad: 0, disfraces: 0 }` con la lista vacía; que `pestanaSiguiente` lleva a la otra pestaña con las flechas (con vuelta desde los extremos), a Navidad con `Home`, a Disfraces con `End` y da `null` con `Enter`, `Tab` y `Escape`; y que en la combinación la búsqueda vacía devuelve todos los de la sección, `grinch` encuentra solo el de la sección con el contador "1 producto", un texto que solo está en la otra sección da el mensaje sin resultados, una sección vacía da lista vacía y `posiciones` no incluye productos de la otra sección. `node --test` en verde.

## Generación (`scripts/`)

- [x] **T3. `tercera_salida` como carpeta de origen y detención si falta.** RF-1, RNF-3, casos límite
  - Añadir `origenesQueFaltan()` a `catalogo/carpetas.ts` con sus tests, y un test en `fusion.test.ts` para el caso de mover `segunda_salida/150_elf` a `tercera_salida/150_elf`. En `generar-catalogo.ts`, importar `ORIGENES` de `secciones.ts`, quitar la lista local, comprobar las carpetas con `origenesQueFaltan()` (falla con todas las que faltan, antes de escribir nada) y actualizar el comentario de cabecera.
  - Hecho cuando: los tests de `origenesQueFaltan` (falta `tercera_salida`, faltan dos, no falta ninguna) y el de mover la carpeta (producto nuevo, nombre por defecto, descripción vacía, sin cambio de precio) pasan, y `node --test` está en verde.

- [x] **T4. Línea por sección en el resumen y regenerar el catálogo.** RF-3, RF-1
  - Añadir `porSeccion` a `DatosResumen` y la línea `Navidad: {n} · Disfraces: {m}` justo después del total en `crearResumen()`, con sus tests primero. Rellenarla en `generar-catalogo.ts` con `contarPorSeccion()`. Ejecutar `npm run catalogo`.
  - Hecho cuando: los tests comprueban que la segunda línea del resumen es `Navidad: 8 · Disfraces: 64` (y `Navidad: 0 · Disfraces: 0` con ceros); `npm run catalogo` termina mostrando la línea, `productos.json` incluye los 8 productos de `tercera_salida` con `origen: "tercera_salida"` y no cambia su formato, y no hay copias "pesadas". `node --test` en verde.

## Interfaz

- [x] **T5. Fotos perezosas de verdad en la tarjeta.** RF-11 (problema conocido RNF-4 de la spec 001)
  - Resultado (2026-11-12): el problema no se reproduce y la plantilla se queda como estaba. En una pestaña limpia (contexto aislado), a 375×812, solo se piden las fotos visibles, y con la búsqueda filtrando las tarjetas ocultas no piden la suya. Las mediciones en las que se pedían las 48 fotos se hicieron en una pestaña que ya las había cargado: Chrome no aplica la carga perezosa a lo que ya tiene en su caché de memoria (respuestas 304). Por eso la comparación con el reordenado no fue concluyente; no hace falta cambiarlo.
  - En `tarjeta-producto.html`, poner `[attr.loading]` y `[attr.fetchpriority]` antes de `[src]`.
  - Hecho cuando: con el catálogo actual (aún sin pestañas), a 375×812 en Chrome DevTools, al abrir la página se piden menos fotos que productos y, al bajar, se van pidiendo las demás. Si no basta, se para y se aplica la alternativa del plan (entrada `visible` en la tarjeta) tras consultarlo. `npm run build` sin avisos.

- [x] **T6. Componente `Pestanas`.** RF-4, RF-6, RF-7, RF-8, RF-10, RF-17, RNF-1, RNF-2
  - Crear `pestanas/` (`.ts`, `.html` y `.css`) con `seleccionada = model.required<Seccion>()` y `controla = input.required<string>()`: `role="tablist"` con un `<button role="tab">` por cada sección de `SECCIONES` (`id="pestana-{id}"`, `aria-selected`, `aria-controls`, `tabindex` itinerante); flechas, Inicio y Fin con `pestanaSiguiente()` y foco con `preventScroll`; estilos del plan (44 px, 16 px, activa en negrita con línea inferior de 3 px, mitad del ancho por debajo de 600 px, sin `sticky`). Todavía no se usa en la página.
  - Hecho cuando: `npm run build` pasa sin avisos nuevos (el CSS del componente pesa menos de 4 kB) y el código hace exactamente lo de RF-4, RF-7 y RF-8.

- [x] **T7. Integrar las pestañas en `Catalogo`.** RF-5, RF-6, RF-9, RF-10, RF-11, RF-13, RF-14, RF-15, RF-17, RF-18
  - En `Catalogo`, añadir `seccion = signal<Seccion>('navidad')`, `deSeccion` y `seccionVacia`, y pasar `resultado` a `buscar(this.deSeccion(), this.texto())`. Pintar `<app-pestanas>` encima del buscador y envolver buscador, mensajes, acciones y cuadrícula en el `role="tabpanel"` con `aria-labelledby`. Ocultar el buscador con `hidden` (no con `@if`). Cambiar el texto del botón a "Ver toda la sección".
  - Hecho cuando: con `ng serve --port 4300`, al entrar se ve Navidad del más caro (Bs. 350) al más barato (Bs. 8); "Disfraces" muestra el resto en el mismo orden; las flechas, Inicio y Fin cambian de pestaña y la página no salta; `grinch` en cada pestaña muestra solo el suyo; al cambiar de pestaña se conserva el texto; cerrar el detalle y "Borrar búsqueda" mantienen la pestaña; al recargar se vuelve a Navidad; en la red, al abrir no se pide ninguna foto de `fotos/primera_salida/` ni `fotos/segunda_salida/`. `npm run build` y `node --test` en verde.

- [x] **T8. Mensaje de sección vacía.** RF-12, RF-15, RF-16, RNF-2
  - Mostrar el mensaje "Todavía no hay productos en esta sección. Escríbenos por WhatsApp para consultar." dentro de la región `aria-live` existente, con prioridad sobre el mensaje sin resultados, y ocultar buscador, acciones y cuadrícula. Estilos en `catalogo.css` (texto partido en líneas; el CSS sigue por debajo de 4 kB).
  - Hecho cuando: probando con una copia temporal de `productos.json` sin productos de `tercera_salida` (y restaurándola después), Navidad muestra el mensaje, Disfraces funciona, un texto escrito en Disfraces se conserva al pasar por Navidad y volver, y el mensaje se anuncia en la región `aria-live`. A 320 px no hay scroll horizontal. `npm run build` sin avisos.

- [x] **T9. Validación final y memoria.** Todos los RF y RNF
  - Pasar Prettier a todos los archivos tocados, ejecutar `node --test` y `npm run build`, y revisar con Chrome DevTools en escritorio, a 375 px y a 320 px:
    - consola y red: sin errores ni avisos nuevos (NG0913 incluido) ni peticiones fallidas;
    - árbol de accesibilidad: pestañas con `aria-selected`, panel con su etiqueta, foco visible;
    - RNF-5: cambio de pestaña en los dos sentidos, con y sin búsqueda, en menos de 100 ms con `--configuration production` y la CPU 4×;
    - RNF-1 y RNF-2: contraste, tamaños y ausencia de scroll horizontal.
  - Actualizar `MEMORY.md` (quitar el problema conocido RNF-4 de la spec 001 si quedó corregido).
  - Hecho cuando: todo lo anterior se cumple, cada RF tiene su test o su comprobación anotada, y las specs 001, 002 y 003 pasan a "implementada" (quitando la nota de cambios pendientes de 001 y 002) cuando lo apruebe el usuario.

## Validación (2026-11-12)

`node --test`: 104 tests en verde. `npm run build`: sin avisos (252,7 kB iniciales). Prettier: sin cambios pendientes. Comprobaciones en Chrome DevTools con `ng serve --configuration production`, en contextos aislados:

| RF / RNF    | Cómo se comprueba                                                | Resultado                                                                                       |
| ----------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| RF-1        | `origenesQueFaltan` (tests) y `npm run catalogo`                 | Se detiene si falta una carpeta; 8 productos de `tercera_salida` en el catálogo                 |
| RF-2        | `seccionDeOrigen` (tests)                                        | Sin datos nuevos en el JSON                                                                     |
| RF-3        | `contarPorSeccion` y `crearResumen` (tests) y `npm run catalogo` | `Navidad: 8 · Disfraces: 40`                                                                    |
| RF-4        | Árbol de accesibilidad                                           | `tablist` "Secciones del catálogo" con "Navidad" y "Disfraces"                                  |
| RF-5, RF-18 | Abrir y recargar                                                 | Navidad activa; la dirección no cambia                                                          |
| RF-6        | Clic y teclado                                                   | Cambia la cuadrícula sin recargar; el foco se queda en la pestaña                               |
| RF-7        | Estilos y árbol de accesibilidad                                 | Activa: negrita y línea de 3 px; `aria-selected`; el panel lleva `aria-labelledby`              |
| RF-8        | `pestanaSiguiente` (tests) y `press_key` (Tab, flecha derecha)   | Tab entra en la activa; las flechas, Inicio y Fin cambian de pestaña                            |
| RF-9        | `productosDeSeccion` (tests) y navegador                         | Navidad de Bs. 350 a Bs. 8; Disfraces de Bs. 280 a Bs. 15; 4 columnas en escritorio, 2 a 375 px |
| RF-10       | Navegador                                                        | Pestañas en el flujo (`position: static`); la página no salta al cambiar                        |
| RF-11       | Red                                                              | Al abrir: logo y 8 fotos de Navidad; al pasar a Disfraces, solo sus fotos visibles              |
| RF-12       | Catálogo temporal sin Navidad (T8)                               | Mensaje de sección vacía, sin buscador ni cuadrícula                                            |
| RF-13       | `@else` existente                                                | Sin productos no hay pestañas (spec 001, RF-29)                                                 |
| RF-14       | Tests y navegador                                                | "grinch" solo en su sección; "mario" en Navidad da "sin resultados"                             |
| RF-15       | Navegador (T7 y T8)                                              | El texto se conserva al cambiar de pestaña y al pasar por una sección vacía                     |
| RF-16       | Navegador                                                        | Mensajes en la región `aria-live`; contador en `role="status"`                                  |
| RF-17       | Navegador                                                        | Detalle y "Ver toda la sección" mantienen la pestaña; Escape en una pestaña no hace nada        |
| RNF-1       | Medido                                                           | Pestañas de 48 px, texto de 16 px, contraste 6,35:1 (inactiva) y 15,27:1 (activa), foco de 3 px |
| RNF-2       | 320, 375 y 1280 px                                               | Sin scroll horizontal; mitad del ancho por pestaña en móvil                                     |
| RNF-3       | Tests                                                            | 104 tests en verde                                                                              |
| RNF-4       | Revisión                                                         | `secciones.ts` sin Angular; `Catalogo` solo encadena funciones puras                            |
| RNF-5       | CPU 4×, 375 px, producción, 5 repeticiones por caso              | Máximo 57 ms (resto entre 9 y 21 ms) en los dos sentidos, con y sin búsqueda                    |
| RNF-6       | Red                                                              | Ninguna petición a terceros; nada guardado en el navegador                                      |

Consola: sin errores; solo el aviso que ya existía del logo del pie ("Lazy-loaded images should have explicit dimensions").
