# Spec 003 — Pestañas Navidad y Disfraces

Estado: aprobada

## Contexto y objetivo

Se acerca la Navidad y el vendedor ha preparado productos navideños (Papá Noel, Mamá Noela, Grinch, elfo, sorpresas, pegatinas…) en una carpeta nueva, `tercera_salida`. Si se mezclan con los disfraces en una sola cuadrícula, los productos de temporada se pierden entre decenas de disfraces. Esta spec divide la página en dos pestañas: **Navidad** (la que se ve al entrar) y **Disfraces** (todo lo que había hasta ahora), para que el visitante vea primero la temporada y pueda cambiar al resto del catálogo con un toque.

Amplía las specs 001 (catálogo) y 002 (buscador). Los productos de `tercera_salida` se generan exactamente igual que los de las otras carpetas (mismo formato de carpeta, precio, fotos, copias web, resumen y conservación de nombre y descripción), y el formato del catálogo no cambia.

Para que las tres specs no se contradigan se han actualizado:

- **Spec 001**: estado, HU-1, Definiciones ("Carpetas de origen"), RF-1, RF-14, RF-17, Criterios de finalización y "Fuera de alcance".
- **Spec 002**: estado, RF-1, RF-2, RF-8, RF-9, RF-12, RF-16 y RF-23.

Esas modificaciones forman parte de esta spec: hasta que la spec 003 esté implementada, el código sigue el comportamiento anterior (constitución, principio 2).

## Usuarios

- **Visitante**: cliente que entra a la página, casi siempre desde el móvil.
- **Administrador**: el vendedor, que organiza las carpetas y ejecuta la generación.

## Historias de usuario

- HU-1. Como visitante, quiero ver primero los productos de Navidad al entrar, para encontrar rápido lo de temporada.
- HU-2. Como visitante, quiero cambiar a la pestaña Disfraces con un solo toque, para ver el resto del catálogo.
- HU-3. Como administrador, quiero añadir un producto navideño creando su carpeta en `tercera_salida`, igual que hago con los disfraces, para no aprender nada nuevo.

## Definiciones

- **Sección**: grupo de productos que se muestra en una pestaña. Se deduce siempre de la carpeta de origen del producto; no se guarda ni se edita en el catálogo. Hay dos:
  - **Navidad**: los productos cuya carpeta de origen es `tercera_salida`.
  - **Disfraces**: los productos cuya carpeta de origen es `primera_salida` o `segunda_salida`.
- **Pestaña activa**: la pestaña cuya sección se está mostrando. Siempre hay exactamente una.
- **Productos de la sección**: los productos del catálogo que pertenecen a la sección de la pestaña activa.
- **Productos visibles**: los productos de la sección si la búsqueda está vacía, o los resultados de la búsqueda dentro de la sección si no lo está (spec 002), siempre en el orden de la spec 001 (RF-17).

## Requisitos funcionales

### Generación

- RF-1: CUANDO el administrador ejecuta la generación, EL SISTEMA trata `tercera_salida` como una carpeta de origen más, con las mismas reglas que `primera_salida` y `segunda_salida` (spec 001, RF-1 a RF-16), incluida la detención con error si falta (spec 001, RF-14).
- RF-2: EL SISTEMA deduce la sección de cada producto a partir de su carpeta de origen, según las Definiciones, sin añadir ningún dato nuevo al catálogo.
- RF-3: CUANDO la generación termina, EL SISTEMA muestra en el resumen, justo después del total de productos, la línea `Navidad: {n} · Disfraces: {m}`, donde `{n}` y `{m}` son el número de productos de cada sección y suman el total.

### Pestañas

- RF-4: MIENTRAS el catálogo tiene al menos un producto, EL SISTEMA muestra entre la cabecera y el buscador dos pestañas con los textos exactos "Navidad" y "Disfraces", en este orden y sin iconos.
- RF-5: CUANDO el visitante abre o recarga la página, EL SISTEMA muestra activa la pestaña "Navidad", aunque su sección esté vacía.
- RF-6: CUANDO el visitante pulsa una pestaña, o la activa con Enter o Espacio, EL SISTEMA la marca como activa y muestra los productos visibles de su sección, sin recargar la página ni cambiar su dirección. El foco se queda en la pestaña.
- RF-7: EL SISTEMA marca la pestaña activa con texto en negrita y una línea de al menos 3 px de grosor debajo de su texto; la pestaña inactiva no tiene ninguna de las dos. Los lectores de pantalla anuncian la pestaña activa como seleccionada y la cuadrícula como contenido de esa pestaña.
- RF-8: MIENTRAS una pestaña tiene el foco, las flechas izquierda y derecha llevan el foco a la otra pestaña y la activan (al llegar a un extremo se pasa al otro), Inicio activa "Navidad" y Fin activa "Disfraces". Solo la pestaña activa está en el orden de la tecla Tab.
- RF-9: EL SISTEMA muestra los productos de la sección con el mismo orden, las mismas tarjetas, el mismo detalle y el mismo número de columnas que la spec 001.
- RF-10: EL SISTEMA no deja las pestañas fijas en la pantalla: se desplazan con el resto de la página, igual que el buscador (spec 002, RF-7). CUANDO el visitante cambia de pestaña, EL SISTEMA no desplaza la página por su cuenta.
- RF-11: EL SISTEMA carga sin esperar a que el visitante se desplace la foto principal de los 8 primeros productos visibles, y nunca pide fotos de productos que no son visibles, tampoco al abrir la página. Las fotos que el navegador ya descargó en una visita anterior a la otra pestaña no cuentan como peticiones nuevas.
- RF-12: SI la sección de la pestaña activa no tiene productos pero el catálogo sí, ENTONCES EL SISTEMA muestra las pestañas y, en lugar del buscador y de la cuadrícula, el mensaje "Todavía no hay productos en esta sección. Escríbenos por WhatsApp para consultar." El botón fijo de WhatsApp sigue visible.
- RF-13: SI el catálogo no tiene ningún producto, ENTONCES EL SISTEMA no muestra las pestañas y se mantiene el mensaje de catálogo vacío de la spec 001 (RF-29).

### Convivencia con el buscador (spec 002)

- RF-14: MIENTRAS hay una búsqueda no vacía, EL SISTEMA busca solo entre los productos de la sección, y el contador y el mensaje sin resultados se refieren a esa sección.
- RF-15: CUANDO el visitante cambia de pestaña, EL SISTEMA conserva el texto de búsqueda y lo aplica a la nueva sección. SI la nueva sección está vacía (RF-12), ENTONCES el buscador se oculta sin borrar su texto, y vuelve a aplicarse al pasar a una sección con productos.
- RF-16: CUANDO el cambio de pestaña cambia el contador de resultados, hace aparecer el mensaje sin resultados o el mensaje de sección vacía, EL SISTEMA lo anuncia a los lectores de pantalla sin mover el foco (como en la spec 002, RF-17).
- RF-17: EL SISTEMA mantiene la pestaña activa al borrar la búsqueda (spec 002, RF-12, RF-13 y RF-16) y al abrir y cerrar el detalle de un producto. Escape con el foco en una pestaña no hace nada.
- RF-18: EL SISTEMA no guarda la pestaña activa: al recargar la página vuelve a "Navidad" (RF-5).

## Requisitos no funcionales

- RNF-1 (accesibilidad): las pestañas se pueden usar solo con teclado, con el foco visible igual que el resto de la página; miden al menos 44 px de alto; sus textos tienen al menos 16 px y un contraste de al menos 4,5:1 con su fondo.
- RNF-2 (diseño): las pestañas usan los mismos colores y la misma fuente que la página. En anchos menores de 600 px cada pestaña ocupa la mitad del ancho. No hay scroll horizontal en ningún ancho desde 320 px, tampoco con el mensaje de sección vacía: los textos largos se cortan en varias líneas.
- RNF-3 (pruebas): tienen tests automáticos la sección que se deduce de cada carpeta de origen (RF-2), los productos de cada sección con su orden (RF-9), la búsqueda dentro de la sección (RF-14), la línea del resumen por sección (RF-3) y la detención de la generación cuando falta `tercera_salida` (RF-1) (constitución, principio 4).
- RNF-4 (separación): la sección de cada producto, los productos de una sección y los productos visibles para una pestaña y un texto de búsqueda se calculan sin abrir la página. La parte visible solo guarda qué pestaña está activa y muestra lo que recibe (constitución, principio 3).
- RNF-5 (rendimiento): con el catálogo real, la cuadrícula se actualiza en menos de 100 ms al cambiar de pestaña en los dos sentidos, con la búsqueda vacía y con una búsqueda activa, medido igual que RNF-1 de la spec 002.
- RNF-6 (privacidad): las pestañas no generan peticiones de red salvo las fotos de RF-11 ni guardan nada en el navegador (constitución, principio 5; no hace falta enmendarla porque no se recoge ningún dato del visitante).

## Casos límite

- Mismo nombre de carpeta en `tercera_salida` y en otra carpeta de origen (p. ej. un `350_grinch` en las dos): son dos productos distintos, cada uno en su pestaña (spec 001, Definiciones). Buscar "grinch" muestra en cada pestaña solo el suyo.
- `grinch` sin precio en `segunda_salida` y `350_grinch` en `tercera_salida`: el primero sigue "no disponible" y el segundo aparece en Navidad.
- Productos de temática navideña fuera de `tercera_salida` (`20_elfo` en `segunda_salida`): siguen en Disfraces. La sección depende solo de la carpeta.
- Mismo nombre visible y distinto precio dentro de Navidad (`8_`, `40_` y `45_sorpresas_navidenas`): tres productos distintos, ordenados por precio.
- Carpeta sin formato en `tercera_salida`: "no disponible", como en las otras carpetas.
- Mover una carpeta entre `tercera_salida` y otra carpeta de origen, en cualquier sentido y con o sin cambio de precio: se quita de su sección y nace como producto nuevo en la otra, con nombre y descripción por defecto. No es un cambio de precio, que exige la misma carpeta de origen (spec 001, Definiciones).
- Falta `tercera_salida`: la generación se detiene y no modifica nada (RF-1).
- `tercera_salida` existe pero está vacía o sin carpetas válidas: la generación termina con `Navidad: 0`; la página se abre en Navidad con el mensaje de RF-12 y el visitante puede pasar a Disfraces.
- Disfraces vacía y Navidad con productos: al pasar a Disfraces se ve el mensaje de RF-12.
- Búsqueda que solo tiene resultados en la otra pestaña: se muestra el mensaje sin resultados de la spec 002; no se avisa de que hay resultados en la otra pestaña.
- Búsqueda activa y cambio a una sección vacía y de vuelta: el texto se conserva y se vuelve a aplicar (RF-15).
- Cambiar de pestaña estando más abajo en la página: las pestañas no son fijas, así que el visitante sube hasta ellas; la cuadrícula empieza justo debajo y la página no salta (RF-10). Si la nueva sección es más corta, el navegador ajusta el desplazamiento al nuevo final de la página.
- Botón "atrás" del navegador: como la dirección no cambia, sale de la página en lugar de volver a la pestaña anterior (ver Fuera de alcance).

## Fuera de alcance

- Más de dos pestañas, pestañas configurables o que se activen por fecha.
- Recordar la pestaña en la dirección de la página o al recargar, enlaces directos a "Disfraces" y volver a la pestaña anterior con el botón "atrás".
- Que un producto aparezca en las dos pestañas o asignar la sección a mano.
- Mostrar en cada pestaña el número de productos.
- Avisar de resultados de búsqueda en la otra pestaña.
- Cambiar el título y el texto de la cabecera según la pestaña: "Disfraces y accesorios" sigue valiendo, porque los productos navideños también son disfraces y accesorios.
- Corregir en la constitución la mención a "las herramientas que incluye macOS" (la generación también funciona en Windows); es anterior a esta spec.

## Criterios de finalización

- Todos los RF se cumplen: los de datos con un test que pasa y los de interfaz con una comprobación en escritorio y a 375 px.
- La generación con las carpetas reales pone en Navidad todos los productos válidos de `tercera_salida` (8 a fecha de 2026-11-12) y en Disfraces los de `primera_salida` y `segunda_salida`, y el resumen muestra la línea de RF-3.
- Al entrar se ve Navidad ordenada del más caro al más barato (a 2026-11-12, de Bs. 350 a Bs. 8).
- A 375×812 px, al abrir la página no se pide ninguna foto de Disfraces, y en total se piden menos fotos que productos tiene Navidad más Disfraces (RF-11). (Comprobado en T5: la tarjeta ya pide solo las fotos visibles.)
- Pasan todos los tests de las specs 001, 002 y 003. El build no tiene avisos de presupuesto nuevos.
- Sin errores ni avisos nuevos en la consola ni peticiones fallidas.
- Se cumplen los 6 principios de `docs/constitution.md`.

## Dudas abiertas

Ninguna.

## Dudas resueltas

Decisiones tomadas tras la revisión de QA (42 hallazgos), aprobadas el 2026-11-12:

- Si falta `tercera_salida`, la generación se detiene, igual que con las otras dos carpetas (RF-1).
- La búsqueda se limita a la pestaña activa (RF-14).
- La cabecera es la misma en las dos pestañas (Fuera de alcance).
- La sección se deduce de la carpeta de origen y no se guarda en el catálogo, así que el formato de los datos no cambia (RF-2).
- Las flechas activan la pestaña directamente (RF-8).
- La página se abre siempre en Navidad, aunque esté vacía (RF-5).
- El mensaje de sección vacía es solo texto, porque el botón fijo de WhatsApp sigue visible (RF-12).
- En el mensaje sin resultados, el botón "Ver todos los productos" pasa a llamarse "Ver toda la sección" (spec 002, RF-16).
