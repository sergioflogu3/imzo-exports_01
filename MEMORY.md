# MEMORY.md — IMZO Ventas

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual

- Proyecto Angular 21 recién generado con el CLI (commit `initial commit`): sin componentes propios, rutas vacías y la plantilla de bienvenida de Angular en `app.html`.
- `CLAUDE.md` creado con el stack, los comandos, las convenciones y las reglas de dominio.
- Fotos de producto fuera del repo: `../primera_salida/` (21 carpetas, sin precio) y `../segunda_salida/` (58 carpetas `<precio>_<producto>`).

## Decisiones (y por qué)

- Nombres de dominio en español (`producto`, `precio`): la app y el negocio están en español.
- El precio se lee del prefijo de la carpeta de `segunda_salida`: es la única fuente de precios que existe ahora mismo.
- Las carpetas de fotos originales no se tocan: son los originales y no tienen copia en el repo.

## Aprendizajes y errores a evitar

- (vacío por ahora)

## Próximos pasos

- Confirmar la moneda de los precios.
- Decidir cómo meter las fotos en `public/` (cuáles, con qué tamaño y con qué formato).
- Definir el modelo `Producto` y el primer listado del catálogo.
