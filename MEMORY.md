# MEMORY.md — IMZO Ventas

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual

- Constitución con 6 principios. Enmiendas aprobadas: principio 1 (la generación puede usar Node y herramientas locales del sistema) y principio 5 (enlaces a Facebook y TikTok; el 2026-10-26, también un buscador que filtra en el navegador).
- Flujo SDD: skill `sdd` (`.agents/skills/sdd/`) y comandos `/sdd-*`. Ojo: los comandos leen mal los argumentos (`$1` y `$2` salen desplazados), así que hay que interpretar la carpeta y la tarea a mano.
- Spec `001-catalogo-productos` implementada. `npm run catalogo` genera las copias web en `public/fotos/` (fuera de git). Catálogo actual: 64 productos (eran 75: el vendedor va quitando lo que se vende, así que la cifra baja con el tiempo y no es un error).
- Spec `002-buscador-productos` **implementada** (aprobada el 2026-10-26): 23 RF, tareas T1–T9 hechas, 79 tests. Lógica en `datos/busqueda.ts` (`buscar()` → `ResultadoBusqueda` con `posiciones`), componente `buscador/` y cuadrícula en `Catalogo`, que crea las 64 tarjetas una vez y oculta las que no coinciden.
- Fotos de producto fuera del repo: `../primera_salida/` y `../segunda_salida/` (carpetas `<precio>_<producto>`).

## Decisiones (y por qué)

- Todo el código propio en español (principio 6). Catálogo, orden y búsqueda en `.ts` puros, testeados sin Angular (principio 3).
- El precio sale del prefijo de la carpeta. Las carpetas originales no se tocan nunca. Moneda: bolivianos (`Bs. 90`).
- Sin `1.jpeg`, la portada es la primera foto válida en orden alfabético. Copias web ≤1200 px (≤300 KB).
- Tests con `node --test` (nativo), sin dependencias (principio 4). `*.test.ts` excluidos en `tsconfig.app.json`.
- Buscador (spec 002): normaliza el texto (minúsculas, sin tildes, signos→espacio) y exige todas las palabras; usa un `input type="text"` sin `<form>` ni `ngModel`; `Escape` borra; el contador va en `role="status"` y el mensaje sin resultados en `aria-live`.
- Las tarjetas se ocultan con `hidden` en lugar de recrearse: recrearlas tardaba hasta 209 ms (CPU 4×, 375 px) y ocultarlas tarda ≤57 ms (RNF-1). `.cuadricula[hidden]` necesita `display: none` explícito porque `display: grid` lo anula.

## Aprendizajes y errores a evitar

- `node --test` exige imports relativos con extensión `.ts`. Entre archivos de `datos/`, `import type` sin extensión.
- En los tests de búsqueda, los textos de "sin resultados" se normalizan (`<b>Ñ` → `b n`) y pueden coincidir: usar fragmentos imposibles (`zz`).
- Diseño: lavanda `#F4F2F8`, tinta `#22182E`, etiqueta `#FFC93C`, fuentes del sistema. Las 8 primeras fotos cargan con prioridad (si no, NG0913).
- El `<dialog>` modal tapa cualquier `position: fixed`: por eso el botón de WhatsApp se repite dentro del detalle.
- `sips`: una foto dañada sale con código 0 y tamaño `<nil>`. Las fotos muy detalladas necesitan calidad 40 para quedar en ≤300 KB.
- Verificación en este equipo:
  - el puerto 4200 lo ocupa otra app (SEGIP), así que se usa `npx ng serve --port 4300`;
  - Chrome no baja de 500 px al redimensionar: usar `emulate` con `375x812x2,mobile,touch`;
  - `kaspersky-labs.com` lo inyecta el antivirus, no la app.
- Medir el rendimiento con `ng serve --configuration production` (el modo de desarrollo infla los tiempos) y contar las fotos con la lista de red de DevTools, no con `performance.getEntriesByType` (no cuenta todas las fotos).
- `TaskStop` cierra la consola, pero no el proceso de `ng serve`: hay que cerrar el proceso de Node por su PID.

## Problemas conocidos (spec 001, sin corregir)

- RNF-4: `tarjeta-producto.html` asigna `[src]` antes que `[attr.loading]`, así que se piden las 64 fotos al cargar, también a 375 px.
- El logo del pie lleva `loading="lazy"` sin `width`/`height` (aviso en la consola).
- El botón de WhatsApp está abajo a la izquierda, pero RF-34 dice "abajo a la derecha".

## Próximos pasos

- Decidir si se corrigen los problemas conocidos de la spec 001.
- Escribir las descripciones de los productos y corregir erratas de nombres (`Harry poter`).
