# MEMORY.md — IMZO Ventas

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual

- Proyecto Angular 21 recién generado con el CLI (commit `initial commit`): sin componentes propios, rutas vacías y la plantilla de bienvenida de Angular en `app.html`.
- `CLAUDE.md` creado con el stack, los comandos, las convenciones y las reglas de dominio.
- `docs/constitution.md` aprobado (6 principios) y enlazado desde `CLAUDE.md`. Skill `frontend-design` y MCP `chrome-devtools` instalados.
- Flujo SDD listo: skill `sdd` (`.agents/skills/sdd/`) y 9 comandos `/sdd-*` en `.claude/commands/`.
- Spec `001-catalogo-productos` aprobada (36 RF). Plan y 9 tareas aprobados; T1-T10 hechas. Validación: 36/36 RF cumplidos; veredicto CAMBIOS NECESARIOS por 1 punto (línea "Copias web" del resumen no está en RF-16). Logo web: `public/logo-web.jpg` (22 KB) generado desde `logo_2.jpeg`. Principio 1 enmendado: la generación puede usar Node y herramientas de macOS (`sips`).
- Fotos de producto fuera del repo: `../primera_salida/` (17 válidas + 4 sin precio) y `../segunda_salida/` (58 carpetas `<precio>_<producto>`).

## Decisiones (y por qué)

- Todo el código propio en español, también los términos técnicos (`CatalogoServicio`): lo exige el principio 6 de la constitución.
- Catálogo como datos `.ts` puros separados de los componentes: principio 3; así el orden por precio se testea sin Angular.
- El precio se lee del prefijo de la carpeta de `segunda_salida`: es la única fuente de precios que existe ahora mismo.
- Las carpetas de fotos originales no se tocan: son los originales y no tienen copia en el repo.
- Moneda: bolivianos (`Bs. 90`). Principio 5 enmendado: se permiten enlaces a Facebook y TikTok, pero sin cargar nada de terceros.
- Sin `1.jpeg`, la portada es la primera foto válida alfabética; nombres legibles (`dark_doll` → `Dark doll`); copias web ≤1200 px de alto (≤300 KB).
- Tests con `node --test` (nativo) en vez de Vitest: cero dependencias (principio 4). Specs en `specs/NNN-*/`. `*.test.ts` excluidos en `tsconfig.app.json`.

## Aprendizajes y errores a evitar

- `node --test` exige imports relativos con extensión `.ts` y solo encuentra `*.test.ts` (no `*.spec.ts`).
- Diseño (T7): lavanda `#F4F2F8`, tinta ciruela `#22182E`, etiqueta de precio caléndula `#FFC93C` colgada de la foto; fuentes del sistema. Las 8 primeras fotos cargan con prioridad (si no, Angular avisa NG0913). Fotos recortadas desde arriba porque las generadas llevan texto abajo.
- El `<dialog>` modal va en la capa superior y tapa cualquier `position: fixed`: por eso el botón de WhatsApp se repite dentro del detalle (RF-34).
- Chrome DevTools MCP no está en esta sesión: se verifica con Chrome headless + CDP desde Node (script en el scratchpad).
- `sips`: con una foto dañada sale con código 0 y devuelve `<nil>` como tamaño; `-Z` agranda las fotos pequeñas. Fotos muy detalladas necesitan bajar hasta calidad 40 para quedar en ≤300 KB.
- Entre archivos de `src/app/datos/` usar `import type` sin extensión: Node lo elimina y Angular compila (comprobado en T1).

## Próximos pasos

- Resolver el punto de la validación de la spec 001 y marcarla como "implementada".
- Escribir las descripciones de los productos en `productos.json` y corregir erratas de nombres (p. ej. `Harry poter`).
