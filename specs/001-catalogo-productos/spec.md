# Spec 001 — Catálogo de productos

Estado: aprobada

## Contexto y objetivo

IMZO vende disfraces y accesorios por WhatsApp. Hoy los productos solo existen como carpetas de fotos en el ordenador del vendedor, con el precio en el nombre de la carpeta. Queremos una página pública y sencilla donde un cliente vea todo el catálogo, del producto más caro al más barato, mire las fotos de cada uno y escriba al vendedor por WhatsApp para comprar. El vendedor tiene que poder actualizar el catálogo sin programar: renombrando carpetas y escribiendo las descripciones a mano.

## Usuarios

- **Visitante**: cliente que entra a la página, casi siempre desde el móvil. No se registra ni inicia sesión.
- **Administrador**: el vendedor. Organiza las carpetas de fotos, ejecuta la generación del catálogo y escribe las descripciones.

## Historias de usuario

- HU-1. Como visitante, quiero ver todos los productos ordenados del más caro al más barato, con su foto, nombre y precio, para encontrar rápido lo que me interesa.
- HU-2. Como visitante, quiero abrir un producto y ver su descripción y todas sus fotos para decidir si lo compro.
- HU-3. Como visitante, quiero escribir al vendedor por WhatsApp con un solo toque para consultar o comprar.
- HU-4. Como visitante, quiero llegar a las redes sociales del vendedor (Facebook y TikTok) para confiar en el negocio.
- HU-5. Como administrador, quiero regenerar el catálogo a partir de las carpetas sin perder las descripciones ni los nombres que ya corregí a mano, aunque cambie el precio de un producto.
- HU-6. Como administrador, quiero retirar un producto con solo renombrar su carpeta para no tener que tocar nada más.
- HU-7. Como visitante, quiero ver el logo de la tienda nada más entrar para saber que estoy en IMZO.

## Definiciones

- **Carpetas de origen**: `primera_salida` y `segunda_salida`.
- **Carpeta de producto válida**: carpeta directamente dentro de una carpeta de origen cuyo nombre es `{precio}_{nombre}`, donde `{precio}` son solo dígitos con valor mayor que 0 y `{nombre}` tiene al menos una letra o un número. Se separa por el **primer** guion bajo (`140_dark_doll` → precio 140, nombre `dark_doll`).
- **Producto**: lo que genera una carpeta de producto válida. Se identifica por su carpeta de origen y el nombre de su carpeta, así que dos carpetas con el mismo nombre visible (`50_calaca` y `95_calaca`) son dos productos distintos.
- **Precio**: número entero de bolivianos. Se muestra como `Bs. {precio}` (p. ej. `Bs. 90`).
- **Foto válida**: archivo `.jpeg`, `.jpg` o `.png` (sin distinguir mayúsculas) cuyo nombre **no** contiene `WhatsApp` (sin distinguir mayúsculas). Los archivos ocultos se ignoran.
- **Orden alfabético**: sin distinguir mayúsculas, con las reglas del español y con los números en orden natural (`2.jpeg` antes que `10.jpeg`).
- **Foto principal**: la foto válida llamada exactamente `1.jpeg`. Si no existe, la primera foto válida en orden alfabético.
- **Nombre visible**: el `{nombre}` de la carpeta con `_` y `-` cambiados por espacios, sin espacios repetidos, con la primera letra en mayúscula y el resto en minúsculas (`DARK_doll` → `Dark doll`).
- **Catálogo**: el listado de productos (nombre, precio, descripción, foto principal y fotos) a partir del cual se pinta la página. A mano solo se editan el **nombre** y la **descripción**. El precio y las fotos salen siempre de las carpetas y se sobrescriben en cada generación.
- **Copia web**: versión de una foto válida preparada para la página, en JPEG y con el lado mayor de 1200 px como máximo.
- **Generación**: el proceso que ejecuta el administrador para crear o actualizar el catálogo y las copias web a partir de las carpetas de origen.
- **Cambio de precio**: en una generación desaparece un producto y aparece exactamente uno nuevo con el mismo `{nombre}` de carpeta en la misma carpeta de origen (`50_bruja` → `55_bruja`).

## Requisitos funcionales

### Generación del catálogo

- RF-1: CUANDO el administrador ejecuta la generación, EL SISTEMA crea un producto en el catálogo por cada carpeta de producto válida de las dos carpetas de origen.
- RF-2: SI una carpeta no cumple el formato de carpeta de producto válida, ENTONCES EL SISTEMA la ignora y la incluye en el resumen como "no disponible".
- RF-3: EL SISTEMA obtiene el precio del prefijo numérico de la carpeta (`090_x` → 90).
- RF-4: CUANDO un producto aparece por primera vez, EL SISTEMA le asigna el nombre visible derivado de la carpeta y una descripción vacía.
- RF-5: CUANDO un producto ya estaba en el catálogo, EL SISTEMA conserva su nombre y su descripción, y actualiza sus fotos.
- RF-6: CUANDO detecta un cambio de precio, EL SISTEMA trata el producto nuevo como el mismo producto: conserva su nombre y su descripción, actualiza el precio y lo incluye en el resumen como "precio cambiado".
- RF-7: EL SISTEMA asigna a cada producto todas sus fotos válidas, con la foto principal en primer lugar y el resto en orden alfabético.
- RF-8: SI una carpeta de producto válida no tiene `1.jpeg`, ENTONCES EL SISTEMA usa como foto principal la primera foto válida en orden alfabético y la incluye en el resumen como "sin 1.jpeg".
- RF-9: SI una foto válida está dañada o no se puede leer, ENTONCES EL SISTEMA la salta y la incluye en el resumen como "foto con error".
- RF-10: SI una carpeta de producto válida no tiene ninguna foto válida que se pueda leer, ENTONCES EL SISTEMA no la añade al catálogo y la incluye en el resumen como "sin fotos".
- RF-11: CUANDO el administrador ejecuta la generación, EL SISTEMA crea la copia web de cada foto válida que no la tenga o cuyo original sea más reciente que su copia, sin modificar, mover ni renombrar los archivos originales.
- RF-12: CUANDO el administrador ejecuta la generación, EL SISTEMA borra las copias web que ya no correspondan a ninguna foto válida de un producto del catálogo.
- RF-13: SI una carpeta que estaba en el catálogo ya no existe o ya no es válida, y no se trata de un cambio de precio, ENTONCES EL SISTEMA quita su producto del catálogo.
- RF-14: SI falta alguna de las dos carpetas de origen, ENTONCES EL SISTEMA detiene la generación con un error y no modifica el catálogo ni las copias web.
- RF-15: SI el catálogo existente tiene un error de formato, ENTONCES EL SISTEMA detiene la generación con un error que indica dónde está el problema y no modifica nada.
- RF-16: CUANDO la generación termina, EL SISTEMA muestra un resumen con el número de productos del catálogo y la lista de carpetas o fotos "no disponible", "sin 1.jpeg", "sin fotos", "foto con error", "precio cambiado" y "pesada" (copia web de más de 300 KB o con el lado mayor de más de 1200 px).

### Página del catálogo

- RF-17: EL SISTEMA muestra todos los productos del catálogo en una cuadrícula ordenada por precio de mayor a menor. A igual precio, por nombre visible en orden alfabético. MIENTRAS el visitante tiene una búsqueda no vacía, la cuadrícula muestra solo los resultados, en este mismo orden (spec 002).
- RF-18: EL SISTEMA muestra en cada tarjeta la foto principal, el nombre visible y el precio en formato `Bs. {precio}`. El nombre y el precio son los textos de mayor tamaño de la tarjeta.
- RF-19: EL SISTEMA muestra la foto de todas las tarjetas con la misma proporción (3:4), recortada para llenar el espacio.
- RF-20: SI el nombre visible no cabe en 2 líneas de la tarjeta, ENTONCES EL SISTEMA lo corta con "…" en la tarjeta y lo muestra completo en el detalle.
- RF-21: EL SISTEMA muestra 2 tarjetas por fila en anchos menores de 600 px (también a 320 px), 3 entre 600 y 1023 px y al menos 4 desde 1024 px, sin scroll horizontal en ningún ancho.
- RF-22: CUANDO el visitante pulsa una tarjeta o la activa con el teclado, EL SISTEMA abre una ventana de detalle con el nombre visible, el precio, la descripción y las fotos del producto.
- RF-23: MIENTRAS la ventana de detalle está abierta, EL SISTEMA muestra una foto grande, entera y sin recortar, y debajo las miniaturas de todas las fotos del producto, empezando por la principal.
- RF-24: CUANDO el visitante pulsa una miniatura o la activa con el teclado, EL SISTEMA la muestra como foto grande.
- RF-25: MIENTRAS la ventana de detalle está abierta, EL SISTEMA impide desplazar la página de detrás.
- RF-26: MIENTRAS la ventana de detalle está abierta, EL SISTEMA permite cerrarla con un botón "Cerrar", con la tecla Escape o pulsando fuera de ella, y al cerrarla devuelve el foco a la tarjeta del producto.
- RF-27: SI la descripción de un producto está vacía, ENTONCES EL SISTEMA no muestra el bloque de descripción en la ventana de detalle.
- RF-28: EL SISTEMA muestra la descripción respetando sus saltos de línea. SI no cabe en la ventana de detalle, ENTONCES la ventana se desplaza por dentro.
- RF-29: SI el catálogo no tiene productos, ENTONCES EL SISTEMA muestra el mensaje "Todavía no hay productos. Escríbenos por WhatsApp para consultar."
- RF-30: EL SISTEMA pone a cada foto un texto alternativo con el nombre visible del producto.
- RF-31: SI una foto no se puede cargar en el navegador, ENTONCES EL SISTEMA muestra en su lugar un recuadro gris con el nombre visible del producto y la tarjeta sigue funcionando.

### Cabecera

- RF-36: EL SISTEMA muestra al inicio de la página, centrados, el logo del vendedor con un tamaño de 300 × 250 px como máximo y, debajo, el título "Disfraces y accesorios" y el texto "Elige tu disfraz y escríbenos por WhatsApp para consultar talla y entrega.". SI no hay logo, ENTONCES muestra en su lugar el texto "IMZO".

### Pie de página y contacto

- RF-32: SI el administrador ha añadido un logo, ENTONCES EL SISTEMA lo muestra en el pie de página con un alto máximo de 64 px. Si no, muestra el texto "IMZO".
- RF-33: EL SISTEMA muestra en el pie de página enlaces a Facebook y TikTok con su icono, que se abren en una pestaña nueva.
- RF-34: EL SISTEMA muestra un botón de WhatsApp fijo abajo a la derecha, siempre visible (también con la ventana de detalle abierta), que abre una conversación con el número del vendedor y un mensaje predefinido.
- RF-35: EL SISTEMA deja al final de la página un margen suficiente para que el botón de WhatsApp no tape la última fila de tarjetas ni los enlaces del pie de página cuando se llega al final.

## Requisitos no funcionales

- RNF-1: La página no carga nada de servidores de terceros (scripts, fuentes, iconos ni imágenes): todas las peticiones van al propio sitio.
- RNF-2: La página no usa cookies, almacenamiento del navegador ni formularios que pidan, envíen o guarden datos, y no recoge datos del visitante. El buscador de la spec 002 filtra en el propio navegador y está permitido.
- RNF-3: Cada copia web pesa como máximo 300 KB y tiene el lado mayor de 1200 px como máximo.
- RNF-4: Al abrir la página en una pantalla de 375×812 px, el navegador pide menos fotos que el número total de productos. Las fotos que no son la principal solo se piden al abrir el detalle del producto.
- RNF-5: Todo se puede usar con el teclado, con el foco siempre visible.
- RNF-6: Todos los textos visibles están en español.
- RNF-7: La generación nunca modifica, mueve ni borra nada dentro de las carpetas de origen.

## Casos límite

- Carpeta con precio `0` (`0_x`), sin nombre (`15_`, `15__`) o sin prefijo (`cruela`): no válida (RF-2).
- Prefijo con ceros a la izquierda (`090_x`): válida, precio 90.
- Nombre con guiones bajos (`140_dark_doll`): el precio se separa por el primer `_`, nombre `Dark doll`.
- Dos productos con el mismo nombre visible y distinto precio (`Calaca` a Bs. 50 y a Bs. 95): aparecen los dos y no es un cambio de precio, porque ninguno desaparece.
- Mismo nombre de carpeta en las dos carpetas de origen: son dos productos distintos.
- Cambio de precio (`50_bruja` → `55_bruja`): mismo producto con el nuevo precio, conserva nombre y descripción (RF-6).
- Desaparecen `50_x` y aparecen `55_x` y `60_x` en la misma carpeta de origen: no es un cambio de precio (no hay exactamente uno nuevo), `50_x` se quita y nacen dos productos nuevos.
- `1.JPEG` o `1.jpg` en lugar de `1.jpeg`: no cuenta como foto principal por nombre, aunque puede salir primera por orden alfabético (RF-8).
- Carpeta con solo fotos de WhatsApp o con todas sus fotos dañadas: "sin fotos" (RF-10).
- Fotos con espacios, paréntesis o puntos en el nombre (`Captura de pantalla … 4.14.06 p. m..png`): se muestran igual.
- Captura de pantalla horizontal: su copia web tiene 1200 px de ancho como máximo.
- Foto que se quita de una carpeta que sigue siendo válida: su copia web se borra (RF-12).
- Precio o fotos editados a mano en el catálogo: se sobrescriben en la siguiente generación.
- El logo aparece dos veces, en la cabecera (RF-36) y en el pie de página (RF-32): es intencionado.
- Se ha movido o renombrado `primera_salida`: la generación se detiene y el catálogo no se vacía (RF-14).

## Fuera de alcance

- Carrito, pagos, stock o disponibilidad por talla.
- Filtros y categorías. (La búsqueda por texto se añade en la spec 002.)
- Mensaje de WhatsApp distinto para cada producto.
- Panel de administración o edición del catálogo desde la web.
- Cerrar la ventana de detalle con el botón "atrás" del móvil.
- Detectar fotos repetidas con distinto nombre dentro de una carpeta.
- Publicar la página en un hosting.
- Otros idiomas.

## Diferencias con la petición original

- La petición pedía guardar el precio como `Bs. XX`. El catálogo lo guarda como número para poder ordenar sin errores, y la página lo muestra como `Bs. XX`.
- La petición pedía que la foto principal fuera estrictamente `1.jpeg`. Como solo 8 de 75 productos la tienen, se aprobó usar la primera foto válida cuando falta (RF-8).
- La petición pedía conservar la descripción "la primera vez". También se conservan el nombre corregido a mano y ambos tras un cambio de precio (RF-5, RF-6).

## Criterios de finalización

- Todos los RF tienen un test que pasa o, si son de interfaz, una comprobación visual en escritorio y a 375 px.
- La generación con las carpetas reales produce 75 productos y lista como "no disponible" `cruela`, `grinch`, `harry_potter` y `radioactivo`.
- La página muestra los 75 productos del más caro (Bs. 380) al más barato (Bs. 15).
- El resumen de la generación no marca ninguna copia como "pesada".
- Se cumplen los 6 principios de `docs/constitution.md`.

## Dudas resueltas

- Número de WhatsApp del vendedor: +591 64134927.
- Mensaje predefinido de WhatsApp: "Hola, vi el catálogo de IMZO y quiero consultar por un producto."
- Facebook: https://www.facebook.com/share/19TqYfiF6o/ · TikTok: https://www.tiktok.com/@imzo216
- Logo: el administrador ya ha añadido una imagen de logo.
