# Tareas 002 — Buscador de productos

Spec: [`spec.md`](spec.md) (aprobada) · Plan: [`plan.md`](plan.md) (aprobado).

Cada tarea se hace con los tests primero (en rojo) y termina con `node --test` en verde y Prettier pasado a los archivos tocados. Las tareas de interfaz terminan además con `npm run build` sin errores ni avisos de presupuesto nuevos.

## Lógica de datos (`src/app/datos/busqueda.ts`, `.ts` puro)

- [x] **T1. Normalización y palabras de búsqueda.** Definiciones (texto normalizado, palabra de búsqueda, búsqueda vacía), RF-9, RNF-5
  - Crear `busqueda.ts` con `LONGITUD_MAXIMA_BUSQUEDA`, `normalizarTexto()` y `palabrasDeBusqueda()`, y `busqueda.test.ts` con sus tests (ver la tabla del plan).
  - Hecho cuando: `node --test` pasa con los casos `"GRÍNCH"`→`"grinch"`, `"Niño"`→`"nino"`, `"Ñandú"`→`"nandu"`, `"Façade"`→`"facade"`, `"spider-man"`→`"spider man"`, `"  a   b  "`→`"a b"`, salto de línea → espacio, `"🎃bruja!"`→`"bruja"`, y `""`, `"   "`, `"-"`, `"\"."` y `"🎃"` → `[]`.

- [x] **T2. Texto buscable y coincidencia.** Definiciones (texto buscable, producto coincidente), RF-8
  - Añadir `textoBuscable()` y `coincide()` con sus tests.
  - Hecho cuando: los tests comprueban que coinciden todas las palabras en cualquier orden, que vale un fragmento (`bru` → "Bruja"), que si falta una palabra no coincide, que una palabra en el nombre y otra en la descripción coinciden, y que `"ab"` no coincide con el nombre "xa" y la descripción "by". `node --test` en verde.

- [x] **T3. Buscar, contador y mensaje sin resultados.** RF-9, RF-10, RF-11, RF-14, RF-15, RNF-5, RNF-6
  - Añadir `ResultadoBusqueda`, `buscar()`, `textoContador()` y `mensajeSinResultados()` con sus tests.
  - Hecho cuando: los tests comprueban que la búsqueda vacía devuelve todo con `contador` y `sinResultados` a `null`, que se conserva el orden de `ordenarPorPrecioDesc`, que salen las dos "Calaca" (95 antes que 50), lo de `spiderman` y `spider-man`, que `90` no busca en el precio, que sin resultados el mensaje lleva el texto original recortado (`"  <q>Ñzz  "`), que el contador da `"1 producto"` y `"12 productos"`, y que la lista recibida no se modifica. `node --test` en verde.

## Interfaz

- [x] **T4. Componente `Buscador`: etiqueta, campo y contador.** RF-1, RF-3, RF-4, RF-5, RF-7, RF-14, RF-17, RNF-3, RNF-4
  - Crear `buscador/` (`.ts`, `.html` y `.css`) con `texto = model('')`, `contador = input()`, la etiqueta "Buscar productos" y un campo `type="text"` con `maxlength` igual a `LONGITUD_MAXIMA_BUSQUEDA`, el texto de ejemplo "Ej.: bruja, dinosaurio", `autocomplete="off"`, `enterkeyhint="search"`, el contador con `role="status"` siempre en el DOM y los estilos del plan. Todavía no se usa en la página.
  - Hecho cuando: `npm run build` pasa sin avisos nuevos (el CSS del componente pesa menos de 4 kB) y el componente tiene exactamente los atributos y textos de RF-1, RF-3 y RF-4.

- [x] **T5. `Buscador`: borrar, Enter y Escape.** RF-6, RF-12, RF-13
  - Añadir el botón "Borrar búsqueda" (solo cuando el campo tiene algún carácter) y el método público `borrar()`, que vacía el campo y lo enfoca. Enter quita el foco del campo, salvo mientras se compone un carácter. Escape borra si hay texto.
  - Hecho cuando: `npm run build` pasa y el código hace exactamente lo de RF-6, RF-12 y RF-13. Se comprueba en el navegador en T6, cuando el buscador ya está en la página.

- [x] **T6. Integrar el buscador en `Catalogo`.** RF-1, RF-2, RF-8, RF-14, RF-18, RF-19, RF-20, RF-22, RF-23
  - En `Catalogo`, añadir `texto = signal('')`, `resultado = computed(...)` y `viewChild(Buscador)`. Pintar `<app-buscador [(texto)] [contador]>` encima de la cuadrícula (solo si hay productos) y recorrer `resultado().productos` con `[prioritaria]="$index < 8"`.
  - Hecho cuando: con `npm start`, al escribir `bruja` solo quedan las brujas, en orden de precio, y el contador dice cuántas hay. Con el campo vacío se ve el catálogo completo, igual que en la spec 001. Escape, "Borrar búsqueda" y Enter funcionan. Al cerrar el detalle de un resultado se conserva la búsqueda. Al recargar la página, el campo aparece vacío. `npm run build` y `node --test` en verde.

- [x] **T7. Bloque sin resultados.** RF-15, RF-16, RF-17, RF-21, RNF-3, RNF-4
  - En `Catalogo`, añadir la región `aria-live="polite"` siempre presente con el mensaje, los botones "Escribir por WhatsApp" (el mismo enlace y la misma apertura que el botón fijo) y "Ver todos los productos" (llama a `borrar()` del buscador), y los estilos del plan (`overflow-wrap: anywhere` y botones de 44 px).
  - Hecho cuando: al buscar `zzz` se ve el mensaje con el texto escrito, sin la cuadrícula. `<b>` se muestra tal cual. "Ver todos los productos" vuelve a mostrar el catálogo y enfoca el campo. El enlace de WhatsApp es el mismo que el del botón fijo. A 320 px, con 50 caracteres sin espacios, no hay scroll horizontal y el botón fijo no tapa los botones. `npm run build` pasa sin avisos de presupuesto nuevos.

- [x] **T9. Ocultar las tarjetas en lugar de recrearlas.** RNF-1, RF-8, RF-10, RF-18, RF-20. *Añadida al validar T8, porque RNF-1 no se cumplía. Se hace antes de cerrar T8.*
  - En `busqueda.ts`, añadir `posiciones` a `ResultadoBusqueda`, con sus tests primero. En `Catalogo`, dejar la cuadrícula siempre creada (oculta cuando no hay resultados), recorrer el catálogo completo, ocultar con `hidden` los `<li>` que no estén en `posiciones` y calcular `prioritaria` con la posición. Añadir `.cuadricula[hidden] { display: none; }`.
  - Hecho cuando: `node --test` está en verde con los tests de `posiciones`, `npm run build` no da avisos, en Chrome se repiten las comprobaciones de T6 y T7, y con el build de producción, a 375 px y con la CPU 4×, ninguna medición de la secuencia de T8 llega a 100 ms.

- [x] **T8. Validación final y memoria.** Todos los RF y RNF
  - Pasar Prettier a todos los archivos tocados, ejecutar `node --test` y `npm run build`, y revisar con Chrome DevTools en escritorio, a 375 px y a 320 px:
    - consola y red: sin avisos ni errores nuevos, NG0913 incluido; escribir solo pide fotos;
    - RNF-1: actualización en menos de 100 ms con la CPU ralentizada 4×;
    - RNF-3: contraste y tamaños.
  - Actualizar `MEMORY.md`.
  - Hecho cuando: todo lo anterior se cumple, cada RF tiene su test o su comprobación anotada, y la spec pasa a "Estado: implementada" cuando la apruebe el usuario.
