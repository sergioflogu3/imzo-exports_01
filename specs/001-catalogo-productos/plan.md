# Plan 001 — Catálogo de productos

Spec: [`spec.md`](spec.md) (aprobada). Constitución: [`docs/constitution.md`](../../docs/constitution.md).

## Visión general

Dos piezas que solo se comunican por archivos:

1. **Generación** (Node 24 + `sips` en macOS o System.Drawing en Windows, la ejecuta el administrador): lee `../primera_salida` y `../segunda_salida`, crea las copias web en `public/fotos/` y escribe `src/app/datos/productos.json`.
2. **Página** (Angular 21): importa `productos.json` en el bundle, lo ordena con funciones puras y lo pinta.

```
../primera_salida ─┐                        ┌─► public/fotos/<origen>/<carpeta>/<foto>.jpg
../segunda_salida ─┴─► npm run catalogo ────┤
                       (scripts/)           └─► src/app/datos/productos.json ─► página Angular
```

## Archivos y responsabilidades

### Datos compartidos (`src/app/datos/`, `.ts` puro, sin Angular — principio 3)

| Archivo | Responsabilidad | RF |
|---|---|---|
| `producto.ts` | Tipo `Producto`: `id`, `origen`, `carpeta`, `nombre`, `precio` (número), `descripcion`, `fotografia_principal`, `fotografias`. Las claves del JSON respetan las de la petición original. | — |
| `catalogo.ts` | `ordenarPorPrecioDesc(productos)`, `formatearPrecio(precio)` → `"Bs. 90"`, `compararTexto(a, b)` (orden alfabético de la spec). | RF-17, RF-18 |
| `contacto.ts` | Constantes `NUMERO_WHATSAPP`, `MENSAJE_WHATSAPP`, `URL_FACEBOOK`, `URL_TIKTOK`, `LOGO` (`string \| null`) y `crearEnlaceWhatsapp(numero, mensaje)`. | RF-32, RF-33, RF-34 |
| `productos.json` | El catálogo. Lo escribe la generación; el administrador solo edita `nombre` y `descripcion`. | — |

### Generación (`scripts/`, fuera de `src/`: Angular no la compila)

| Archivo | Responsabilidad | RF |
|---|---|---|
| `catalogo/carpetas.ts` | Puras: `analizarCarpeta(nombre)` → `{ precio, nombre } \| null`, `nombreVisible(nombre)`, `esFotoValida(archivo)`, `ordenarFotos(archivos)` → `{ principal, fotos, tiene1jpeg }`, `nombreCopia(archivo)`. | RF-2, RF-3, RF-4, RF-7, RF-8 |
| `catalogo/fusion.ts` | Pura: `fusionarCatalogo(existente, escaneados)` → `{ catalogo, nuevos, quitados, preciosCambiados }`. | RF-4, RF-5, RF-6, RF-13 |
| `catalogo/validacion.ts` | Pura: `validarCatalogo(datos)` → lista de errores con su posición (`[12].descripcion: no es texto`). | RF-15 |
| `catalogo/resumen.ts` | Puras: `esCopiaPesada({ bytes, ancho, alto })` y `crearResumen(datos)` → texto. | RF-16, RNF-3 |
| `catalogo/imagenes.ts` | Con efectos: `leerDimensiones(ruta)` y `crearCopiaWeb(origen, destino)` usando `sips` en macOS o System.Drawing en Windows. | RF-9, RF-11 |
| `generar-catalogo.ts` | Orquesta: comprueba las carpetas de origen, lee el disco, llama a las funciones puras, crea y borra copias, escribe el JSON e imprime el resumen. | RF-1, RF-10, RF-11, RF-12, RF-14, RNF-7 |

### Interfaz (`src/app/`)

| Archivo | Responsabilidad | RF |
|---|---|---|
| `app.ts` / `app.html` / `app.css` | Sustituye la plantilla del CLI: cabecera centrada con el logo (o el texto "IMZO" si `LOGO` es `null`), título y bajada; `<app-catalogo>`, `<app-pie-pagina>` y `<app-boton-whatsapp>`. | RF-36 |
| `catalogo/catalogo.*` | Lee `productos.json`, lo ordena con `ordenarPorPrecioDesc`, pinta la cuadrícula o el mensaje de catálogo vacío y gestiona qué producto está abierto. | RF-17, RF-21, RF-29 |
| `tarjeta-producto/tarjeta-producto.*` | Un `<button>` con la foto (3:4, `loading="lazy"`), el nombre (2 líneas) y el precio. Si la foto falla, muestra el recuadro gris. | RF-18, RF-19, RF-20, RF-22, RF-30, RF-31 |
| `detalle-producto/detalle-producto.*` | `<dialog>` nativo con `showModal()`: foto grande, miniaturas, descripción y botón "Cerrar". | RF-22 a RF-28, RF-30, RF-31 |
| `pie-pagina/pie-pagina.*` | Logo o texto "IMZO", y enlaces a Facebook y TikTok con iconos SVG propios. | RF-32, RF-33, RF-35 |
| `boton-whatsapp/boton-whatsapp.*` | Enlace fijo abajo a la derecha con icono SVG propio. | RF-34 |
| `app.spec.ts` | **Se borra**: prueba la plantilla del CLI con Vitest, que ya no se usa (principio 4). | — |

### Otros cambios

- `package.json`: scripts `"catalogo": "node scripts/generar-catalogo.ts"` y `"test": "node --test"`. Sin dependencias nuevas.
- `.gitignore`: añadir `/public/fotos/`.
- `tsconfig.json`: añadir `"resolveJsonModule": true` solo si el build no acepta importar el JSON (se comprueba en T7).

## Algoritmos

### Analizar una carpeta (RF-2, RF-3)

```
analizarCarpeta(nombre):
  coincide /^(\d+)_(.+)$/ ?  si no → null
  precio ← entero(grupo 1);  si precio = 0 → null
  resto ← grupo 2;           si resto no tiene ninguna letra o número → null
  devolver { precio, nombre: resto }
```

### Nombre visible (RF-4)

```
nombreVisible(nombre):
  t ← nombre con "_" y "-" cambiados por espacio, espacios repetidos unidos, sin espacios en los extremos
  devolver mayúscula(t[0]) + minúsculas(t[1..])
```

### Fotos (RF-7, RF-8)

```
compararTexto ← Intl.Collator('es', { sensitivity: 'base', numeric: true }).compare
ordenarFotos(archivos):
  válidas ← archivos que no empiezan por "." y con extensión jpeg/jpg/png y sin "whatsapp" (sin mayúsculas)
  ordenar válidas con compararTexto
  si "1.jpeg" ∈ válidas → principal ← "1.jpeg", tiene1jpeg ← sí
  si no → principal ← válidas[0], tiene1jpeg ← no
  devolver { principal, fotos: [principal, ...resto sin principal], tiene1jpeg }
```

Nombre de la copia: `nombreCopia(archivo)` = archivo en minúsculas, con todo lo que no sea `a-z0-9` cambiado por `-`, sin guiones repetidos, y con `.jpg` al final (`Captura de pantalla … p. m..png` → `captura-de-pantalla-…-p-m-png.jpg`). Así las URL no llevan espacios y no chocan `a.png` y `a.jpeg`.

### Fusionar con el catálogo existente (RF-4, RF-5, RF-6, RF-13)

```
fusionarCatalogo(existente, escaneados):            // id = "<origen>/<carpeta>"
  porId ← existente indexado por id
  para cada e en escaneados:
    si e.id ∈ porId → conservar nombre y descripcion de porId[e.id]; precio y fotos de e
    si no           → nuevo provisional (nombreVisible, descripcion "")
  quitados ← existentes cuyo id no está en escaneados
  para cada grupo (origen, nombre de carpeta sin precio):
    si en el grupo hay exactamente 1 quitado y exactamente 1 nuevo:
      el nuevo hereda nombre y descripcion del quitado → preciosCambiados
      el quitado deja de contar como quitado
  devolver { catalogo, nuevos, quitados, preciosCambiados }
```

### Generación (RF-1, RF-9 a RF-16)

```
1. Si falta ../primera_salida o ../segunda_salida → error y salir sin tocar nada.          (RF-14)
2. Si existe productos.json: parsear y validarCatalogo. Si hay errores → error y salir.    (RF-15)
3. Para cada carpeta de cada origen (nombres tal como los da readdir):
     analizarCarpeta → si null: "no disponible"
     ordenarFotos sobre readdir(carpeta)
     para cada foto válida:                                                               (RF-9, RF-11)
       destino ← public/fotos/<origen>/<carpeta>/<nombreCopia>
       si no existe destino o mtime(original) > mtime(destino):
        dimensiones ← leerDimensiones; si falla → "foto con error", saltar
        crearCopiaWeb: convertir a JPEG calidad 80; limitar a 1200 px si el lado mayor lo supera
        si la copia pasa de 300 KB → repetir con calidad 65, luego 50 y luego 40
       medir copia → si esCopiaPesada → "pesada"
     si no queda ninguna foto legible → "sin fotos", no se añade                           (RF-10)
     si no tiene1jpeg → "sin 1.jpeg"
4. fusionarCatalogo; escribir productos.json (orden de precio desc, con 2 espacios).       (RF-1, RF-6, RF-13)
5. Borrar en public/fotos/ todo lo que no sea copia de un producto del catálogo.           (RF-12)
6. Imprimir crearResumen.                                                                   (RF-16)

```

Nunca se escribe ni se borra nada fuera de `public/fotos/` y `productos.json` (RNF-7).

### Orden en la página (RF-17)

```
ordenarPorPrecioDesc(productos) = copia ordenada por (b.precio − a.precio), y si empatan, compararTexto(a.nombre, b.nombre)
```

## Interfaz

- **Cuadrícula** (RF-21): `display: grid` con 2 columnas por debajo de 600 px, 3 entre 600 y 1023 px y `repeat(auto-fill, minmax(220px, 1fr))` desde 1024 px.
- **Tarjeta** (RF-18 a RF-20): `aspect-ratio: 3 / 4` y `object-fit: cover`. El nombre se corta con `-webkit-line-clamp: 2`. El nombre y el precio son los textos más grandes de la tarjeta.
- **Detalle** (RF-22 a RF-28): `<dialog>` con `showModal()`, que ya incluye Escape, foco atrapado y el resto de la página inerte. Pulsar fuera se detecta con un clic cuyo `target` es el propio `<dialog>`. La página de detrás se bloquea con `body:has(dialog[open]) { overflow: hidden }`. Al cerrar, el foco vuelve a la tarjeta. La foto grande usa `object-fit: contain`. La descripción usa `white-space: pre-line` y la ventana tiene `overflow: auto`.
- **Fotos secundarias** (RNF-4): las miniaturas y la foto grande solo existen en el DOM mientras el detalle está abierto (`@if`).
- **Error de foto** (RF-31): un `(error)` en la `<img>` activa un `signal` que la cambia por el recuadro gris.
- **Cabecera** (RF-36): logo de `LOGO` (la copia ligera `public/logo-web.jpg`) con un tamaño máximo de `300 × 250px`, `fetchpriority="high"` porque está arriba, y título y bajada con `text-align: center`.
- **Pie de página y WhatsApp** (RF-32 a RF-35): el botón con `position: fixed` abajo a la izquierda y `padding-bottom` en el pie igual a su alto más un margen. Enlaces con `target="_blank" rel="noopener noreferrer"`.
- **Diseño visual**: se decide en T7 con la skill `frontend-design`. Tipografías del sistema o archivos de fuente dentro de la app: nunca de Google Fonts (RNF-1).

## Decisiones (y alternativa descartada)

| Decisión | Alternativa descartada y por qué |
|---|---|
| `productos.json` se **importa en el bundle**. | Pedirlo con `fetch` al cargar: obligaría a gestionar estados de carga y de error que la spec no define. Con 75 productos el JSON pesa unos 25 KB. |
| La generación se escribe en **TypeScript ejecutado por Node 24** (`node scripts/generar-catalogo.ts`). | Un `.mjs`: serían dos lenguajes y se perderían los tipos compartidos con `producto.ts`. |
| Entre archivos de `src/app/datos/` solo se usan **`import type` sin extensión**. Node los elimina al ejecutar y Angular los acepta. | Activar `allowImportingTsExtensions` en los tsconfig: es un cambio de configuración que se puede evitar. |
| **`sips`** para redimensionar (principio 1 enmendado). | Una librería como `sharp`: dependencia nueva (principio 1). Copiar sin redimensionar: incumple RNF-3. |
| Copias con **nombre normalizado** (`nombreCopia`). | Mantener el nombre original: obliga a codificar espacios y caracteres especiales en cada URL, y `a.png` y `a.jpeg` chocarían. |
| `public/fotos/` **fuera de git**. Se regenera con `npm run catalogo`. `productos.json` **sí** va en git, porque tiene las descripciones. | Subir las fotos: unos 30 MB de imágenes en el historial que se pueden regenerar desde los originales. |
| Modal con **`<dialog>` nativo**. | Un modal hecho a mano o el CDK de Angular: más código o una dependencia nueva para lo que el navegador ya da. |
| Configuración de contacto como **constantes en `contacto.ts`**. | Leer el logo comprobando si existe el archivo: genera un 404 visible en la pestaña de red. |
| `npm test` pasa a ser `node --test`. | Mantener `ng test`: apuntaría a Vitest, que ya no se usa (principio 4). |

## Estrategia de tests (`node --test`)

Tests `*.test.ts` junto a cada archivo puro, con `node:test` y `node:assert/strict`:

| Test | Casos | RF |
|---|---|---|
| `src/app/datos/catalogo.test.ts` | Orden descendente, empate por nombre con tildes y mayúsculas, no modifica el original, `formatearPrecio(90)` → `Bs. 90`. | RF-17, RF-18 |
| `src/app/datos/contacto.test.ts` | El enlace es `https://wa.me/<dígitos>?text=<codificado>`, quita `+` y espacios del número y codifica tildes y signos `¿?`. | RF-34 |
| `scripts/catalogo/carpetas.test.ts` | Todos los casos límite de carpetas (`0_x`, `15_`, `15__`, `cruela`, `090_x`, `140_dark_doll`), `nombreVisible`, WhatsApp en mayúsculas o minúsculas, `.DS_Store`, `1.jpeg` frente a `1.JPEG`, `2` antes que `10`, `nombreCopia`. | RF-2, RF-3, RF-4, RF-7, RF-8 |
| `scripts/catalogo/fusion.test.ts` | Nuevo, existente, quitado, cambio de precio, `50_x` → `55_x` + `60_x`, `calaca` 50/95 y mismo nombre en los dos orígenes. | RF-4, RF-5, RF-6, RF-13 |
| `scripts/catalogo/validacion.test.ts` | JSON válido, campos que faltan, tipos erróneos y error con su posición. | RF-15 |
| `scripts/catalogo/resumen.test.ts` | `esCopiaPesada` en sus límites (300 KB, 1200 px) y un resumen con cada categoría. | RF-16, RNF-3 |

Sin test automático, con verificación manual o con Chrome DevTools:
- **Generación real**: 75 productos, 4 "no disponible", 0 "pesada". Una segunda ejecución no crea ninguna copia. Los originales no cambian (se comparan las sumas de verificación antes y después). Cubre RF-1, RF-9 a RF-12, RF-14 y RNF-7.
- **Interfaz**: capturas a 320, 375, 768 y 1280 px. Pestaña de red: menos fotos pedidas que productos, nada de otros dominios y ningún 404. Navegación solo con teclado. Cubre RF-17 a RF-35 y RNF-1 a RNF-6.

## Riesgos

- **El build de Angular con `import type` sin extensión y el import de JSON**: se comprueba en T1 y T7. Si falla, se pedirá aprobación para cambiar el tsconfig.
- **Dudas abiertas de la spec** (número, mensaje, redes y logo): T9 queda bloqueada hasta tenerlas. Hasta entonces, `contacto.ts` lleva valores de ejemplo marcados con `// PENDIENTE`.
