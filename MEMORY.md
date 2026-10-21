# MEMORY.md — IMZO Ventas

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual

- Proyecto Angular 21 recién generado con el CLI (commit `initial commit`): sin componentes propios, rutas vacías y la plantilla de bienvenida de Angular en `app.html`.
- `CLAUDE.md` creado con el stack, los comandos, las convenciones y las reglas de dominio.
- `docs/constitution.md` aprobado (6 principios) y enlazado desde `CLAUDE.md`. Skill `frontend-design` y MCP `chrome-devtools` instalados.
- Flujo SDD listo: skill `sdd` (`.agents/skills/sdd/`) y 9 comandos `/sdd-*` en `.claude/commands/`. Siguiente: `/sdd-spec 001-listado-productos`.
- Fotos de producto fuera del repo: `../primera_salida/` (21 carpetas, sin precio) y `../segunda_salida/` (58 carpetas `<precio>_<producto>`).

## Decisiones (y por qué)

- Todo el código propio en español, también los términos técnicos (`CatalogoServicio`): lo exige el principio 6 de la constitución.
- Catálogo como datos `.ts` puros separados de los componentes: principio 3; así el orden por precio se testea sin Angular.
- El precio se lee del prefijo de la carpeta de `segunda_salida`: es la única fuente de precios que existe ahora mismo.
- Las carpetas de fotos originales no se tocan: son los originales y no tienen copia en el repo.
- Tests con `node --test` (nativo) en vez de Vitest: cero dependencias (principio 4). Specs en `specs/NNN-*/`. `*.test.ts` excluidos en `tsconfig.app.json`.

## Aprendizajes y errores a evitar

- `node --test` exige imports relativos con extensión `.ts` y solo encuentra `*.test.ts` (no `*.spec.ts`).

## Próximos pasos

- Confirmar la moneda de los precios.
- Decidir cómo meter las fotos en `public/` (cuáles, con qué tamaño y con qué formato).
- Confirmar el número de WhatsApp del negocio.
- Escribir en `docs/` la spec del listado y, después, el modelo `Producto` y el primer listado.
