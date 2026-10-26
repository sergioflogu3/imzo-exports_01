# Spec 002 — Buscador de productos

Estado: implementada

## Contexto y objetivo

El catálogo tiene decenas de productos (64 en el catálogo actual) en una sola cuadrícula ordenada por precio. Para encontrar un disfraz concreto, el visitante tiene que recorrer toda la página. Esta spec añade un buscador de texto que filtra la cuadrícula mientras se escribe, para que el visitante llegue antes al producto y lo consulte por WhatsApp.

Amplía la spec 001 (catálogo de productos). Con la búsqueda vacía, la página se comporta exactamente como en la spec 001. En la spec 001 se han actualizado RF-17, RNF-2 y "Fuera de alcance" para que las dos specs no se contradigan. El principio 5 de la constitución se ha enmendado para permitir un buscador que filtra en el propio navegador.

## Usuarios

- **Visitante**: cliente que entra al catálogo, normalmente desde el móvil, buscando un disfraz o accesorio concreto.

## Historias de usuario

- HU-1. Como visitante, quiero escribir el nombre de un disfraz y ver solo los productos que coinciden, para no recorrer todo el catálogo.
- HU-2. Como visitante, quiero que la búsqueda funcione aunque escriba sin tildes, sin mayúsculas o con signos, para no tener que acertar la forma exacta del nombre.
- HU-3. Como visitante, quiero saber cuántos productos he encontrado o que no hay ninguno, y poder preguntar por WhatsApp, para no irme sin respuesta.
- HU-4. Como visitante, quiero borrar la búsqueda con un solo gesto, para volver a ver todo el catálogo.

## Definiciones

- **Texto de búsqueda**: lo que hay escrito en el campo de búsqueda en cada momento, incluidos los cambios intermedios mientras se compone una letra con tilde o se usa el teclado predictivo.
- **Texto normalizado**: el resultado de aplicar a un texto, en este orden:
  1. pasarlo a minúsculas (también `Ñ`→`ñ`);
  2. quitar cualquier marca sobre las letras (`á`, `à`, `ä`, `â`→`a`; `ç`→`c`; `ñ`→`n`);
  3. cambiar por un espacio todo carácter que no sea una letra de la `a` a la `z` o un dígito (guiones, apóstrofos, puntos, comillas, saltos de línea, emojis…);
  4. reducir los espacios repetidos a uno y quitar los del principio y el final.
- **Palabra de búsqueda**: cada trozo del texto de búsqueda normalizado separado por espacios.
- **Búsqueda vacía**: texto de búsqueda que, una vez normalizado, no tiene ninguna palabra (vacío, solo espacios o solo signos y emojis).
- **Texto buscable de un producto**: su nombre visible y su descripción, normalizados y unidos con un espacio entre ambos.
- **Producto coincidente**: producto cuyo texto buscable contiene **todas** las palabras de búsqueda, en cualquier orden, cada una como fragmento de texto seguido (no hace falta que sea una palabra completa). Como ninguna palabra de búsqueda tiene espacios y el nombre y la descripción se unen con un espacio, una palabra nunca coincide a caballo entre el final del nombre y el principio de la descripción. Ejemplos: `bru` coincide con "Bruja"; `dino peque` y `peque dino` coinciden con "Dino peque".
- **Resultados**: los productos coincidentes de una búsqueda no vacía.

## Requisitos funcionales

### Buscador

- RF-1: MIENTRAS el catálogo tiene al menos un producto, EL SISTEMA muestra entre la cabecera y la cuadrícula una etiqueta visible "Buscar productos" y, debajo, un campo de búsqueda asociado a esa etiqueta con el texto de ejemplo "Ej.: bruja, dinosaurio", que desaparece al escribir.
- RF-2: SI el catálogo no tiene productos, ENTONCES EL SISTEMA no muestra el buscador y se mantiene el mensaje de catálogo vacío de la spec 001 (RF-29).
- RF-3: EL SISTEMA admite como máximo 50 caracteres en el campo. Lo que se escribe o se pega de más se descarta sin mostrar ningún aviso.
- RF-4: EL SISTEMA no muestra sugerencias del navegador con búsquedas anteriores y no deja que el navegador las guarde.
- RF-5: EL SISTEMA muestra un único botón para borrar dentro del campo (el de RF-12), sin el botón de borrar propio del navegador.
- RF-6: CUANDO el visitante pulsa Enter (o la tecla de buscar del teclado del móvil) en el campo, EL SISTEMA no recarga la página, no cambia la dirección de la página ni los resultados, y quita el foco del campo para ocultar el teclado del móvil.
- RF-7: EL SISTEMA no deja el buscador fijo en la pantalla: se desplaza con el resto de la página.

### Filtrado

- RF-8: CUANDO cambia el texto de búsqueda, EL SISTEMA muestra en la cuadrícula solo los resultados, sin necesidad de pulsar ningún botón ni Enter.
- RF-9: MIENTRAS la búsqueda está vacía, EL SISTEMA muestra todos los productos del catálogo y no muestra el contador de resultados (RF-14) ni el mensaje sin resultados (RF-15).
- RF-10: EL SISTEMA muestra los resultados en el mismo orden que el catálogo completo: precio de mayor a menor y, a igual precio, por nombre visible en orden alfabético.
- RF-11: EL SISTEMA trata como productos distintos los que tienen el mismo nombre visible y distinto precio, y muestra todos los que coincidan.

### Borrar la búsqueda

- RF-12: MIENTRAS el campo tiene algún carácter, EL SISTEMA muestra dentro del campo un botón con el nombre accesible "Borrar búsqueda". CUANDO el visitante lo pulsa, EL SISTEMA vacía el campo, muestra todos los productos y devuelve el foco al campo.
- RF-13: CUANDO el visitante pulsa Escape con el foco en el campo y el campo tiene algún carácter, EL SISTEMA se comporta igual que al pulsar "Borrar búsqueda" (RF-12). Con el campo vacío, Escape no hace nada.

### Contador y sin resultados

- RF-14: MIENTRAS hay una búsqueda no vacía con resultados, EL SISTEMA muestra debajo del campo el texto "1 producto" o "{n} productos", según el número de resultados.
- RF-15: SI una búsqueda no vacía no tiene resultados, ENTONCES EL SISTEMA muestra en lugar de la cuadrícula el mensaje `No encontramos "{texto}". Escríbenos por WhatsApp y te ayudamos.`, donde `{texto}` es el texto de búsqueda tal como lo escribió el visitante (sin normalizar), sin espacios al principio ni al final y mostrado literalmente, sin interpretar ningún carácter.
- RF-16: MIENTRAS se muestra el mensaje sin resultados, EL SISTEMA muestra debajo de él dos botones: "Escribir por WhatsApp", con el mismo destino, el mismo mensaje predefinido y la misma forma de abrirse que el botón fijo de WhatsApp de la spec 001 (RF-34), y "Ver todos los productos", que vacía el campo, muestra todos los productos y devuelve el foco al campo.
- RF-17: CUANDO cambia el contador de resultados o aparece el mensaje sin resultados, EL SISTEMA lo anuncia a los lectores de pantalla sin mover el foco ni interrumpir lo que el visitante está escribiendo.

### Convivencia con el catálogo

- RF-18: EL SISTEMA muestra las tarjetas de los resultados con el mismo tamaño y el mismo número de columnas que el catálogo completo (spec 001, RF-21), alineadas a la izquierda aunque no llenen la fila. El pie de página va justo después de la cuadrícula o del mensaje sin resultados.
- RF-19: CUANDO cambian los resultados, EL SISTEMA no desplaza la página por su cuenta.
- RF-20: CUANDO cambian los resultados, EL SISTEMA carga sin esperar a que el visitante se desplace la foto principal de los 8 primeros resultados, y no pide fotos de productos que no están en los resultados.
- RF-21: EL SISTEMA deja al final de la página el mismo margen de la spec 001 (RF-35), de modo que el botón fijo de WhatsApp no tape los botones del mensaje sin resultados, tampoco a 320 px.
- RF-22: CUANDO el visitante abre la ventana de detalle desde un resultado, EL SISTEMA se comporta igual que en la spec 001 y, al cerrarla, conserva el texto de búsqueda, los resultados y el contador.
- RF-23: EL SISTEMA no guarda el texto de búsqueda: al recargar la página el campo aparece vacío y se ve todo el catálogo.

## Requisitos no funcionales

- RNF-1 (rendimiento): con el catálogo real, la cuadrícula se actualiza en menos de 100 ms desde cada tecla, medido con Chrome DevTools a 375 px de ancho y con la CPU ralentizada 4×.
- RNF-2 (privacidad): el texto de búsqueda no sale del navegador: escribir no genera ninguna petición de red salvo las fotos de RF-20, y no se guarda en ningún almacenamiento (constitución, principio 5).
- RNF-3 (accesibilidad): el campo y sus botones se pueden usar solo con teclado y con el foco visible igual que el resto de la página; tienen nombre accesible distinto entre sí; el campo y los botones miden al menos 44 px de alto; el texto del campo tiene al menos 16 px (así el móvil no amplía la página al tocarlo); todos los textos del buscador tienen un contraste de al menos 4,5:1 con su fondo.
- RNF-4 (diseño): el buscador usa los mismos colores y la misma familia de fuente que la página de la spec 001. No hay scroll horizontal en ningún ancho desde 320 px, ni siquiera con un mensaje sin resultados de 50 caracteres sin espacios: el texto largo se corta en varias líneas.
- RNF-5 (pruebas): tienen tests automáticos la normalización, la regla de coincidencia, la búsqueda vacía (RF-9), el orden de los resultados (RF-10), los productos con el mismo nombre (RF-11) y el texto del contador (RF-14) (constitución, principio 4).
- RNF-6 (separación): el cálculo de los resultados y del contador se puede probar sin abrir la página; la parte visible solo muestra lo que recibe (constitución, principio 3).

## Casos límite

- Solo espacios (`"   "`), solo signos (`-`, `"`, `.`) o solo emojis: búsqueda vacía; se ve todo el catálogo, sin contador ni mensaje sin resultados (RF-9). El botón "Borrar búsqueda" sí aparece, porque el campo tiene caracteres (RF-12).
- Mayúsculas y tildes (`BRUJA`, `brujá`): mismo resultado que `bruja` (Definiciones).
- `ñ` se normaliza a `n`: `nino` encuentra "niño" y también puede haber coincidencias no deseadas (`ano` encuentra "año"). Se acepta.
- Signos dentro de un nombre: `spider-man` encuentra "Spider man", pero `spiderman` no (el guion se convierte en espacio y no se unen palabras).
- Varias palabras en distinto orden (`dino peque` y `peque dino`): mismo resultado (RF-8).
- Una palabra en el nombre y otra en la descripción: coincide.
- Dos productos con el mismo nombre visible y distinto precio (dato de prueba: "Calaca" a Bs. 95 y a Bs. 50): `calaca` muestra los dos, primero el de Bs. 95 (RF-10, RF-11).
- Producto con descripción vacía (hoy, todos): solo se busca en su nombre.
- Una sola letra (`a`): se muestran todos los productos que la contienen, aunque sean casi todos. No hay longitud mínima.
- Números (`90`): se buscan como texto en el nombre y la descripción, no en el precio.
- Caracteres especiales en el mensaje sin resultados (`<b>`, `%`, `"`): se muestran tal cual y no alteran la página (RF-15).
- Pegar un texto de más de 50 caracteres: solo se conservan los 50 primeros (RF-3).
- Escribir una letra con tilde en dos pulsaciones o con teclado predictivo: el filtro se aplica a lo que haya en el campo en cada cambio (Definiciones).
- Buscar estando más abajo en la página: el buscador no está fijo, así que el visitante tiene que subir hasta él (RF-7). Al filtrar, la página no salta por su cuenta (RF-19).
- 1 a 3 resultados en escritorio: las tarjetas mantienen su tamaño y quedan a la izquierda (RF-18).

## Fuera de alcance

- Conservar la búsqueda en la dirección de la página o al recargar.
- Filtros por precio, rango de precios o categoría.
- Sugerencias, autocompletado y corrección de erratas (`poter` no encuentra "Potter").
- Incluir el texto buscado en el mensaje de WhatsApp.
- Buscar por precio.
- Resaltar en las tarjetas las palabras que coinciden.
- Dejar el buscador fijo en la pantalla al desplazarse.

## Criterios de finalización

- Todos los RF se cumplen: los de datos con un test que pasa y los de interfaz con una comprobación en escritorio y a 375 px.
- Los tests de RNF-5 pasan, junto con todos los de la spec 001.
- Con la búsqueda vacía, la página es igual que en la spec 001 (mismo orden y mismas tarjetas) y RNF-4 de la spec 001 se sigue cumpliendo.
- Al escribir no hay errores ni avisos nuevos en la consola, ni más peticiones de red que las fotos de RF-20.
- El build no tiene avisos de presupuesto nuevos.
- Se cumplen los 6 principios de `docs/constitution.md`, con el principio 5 enmendado.

## Dudas abiertas

Ninguna.

## Dudas resueltas

- Campos de búsqueda: nombre visible y descripción. No se busca por precio.
- Coincidencia: tolerante a mayúsculas, tildes y signos; todas las palabras, en cualquier orden, como fragmento de texto.
- El filtro se aplica mientras se escribe, sin botón "Buscar".
- Sin resultados: mensaje con invitación a WhatsApp y botón para ver todos los productos.
- Se muestra el número de resultados y se anuncia a los lectores de pantalla (RF-14, RF-17).
- El buscador no queda fijo arriba (RF-7).
- Escape borra la búsqueda (RF-13).
- Principio 5 enmendado: "sin formularios que pidan, envíen o guarden datos del visitante (se permite un buscador que filtra en el propio navegador)".
- Revisión de QA (31 hallazgos) resuelta en esta versión de la spec.
