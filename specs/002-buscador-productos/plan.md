# Plan 002 — Buscador de productos

Spec: [`spec.md`](spec.md) (aprobada). Cumple `docs/constitution.md` (principio 5 enmendado).

## Visión general

Toda la lógica de búsqueda (normalizar, partir en palabras, decidir si un producto coincide, filtrar y preparar los textos del contador y del mensaje sin resultados) va en un archivo `.ts` puro dentro de `src/app/datos/`, con sus tests de `node --test`. El componente `Catalogo` guarda el texto escrito en una `signal` y obtiene con un `computed` el resultado ya calculado. Un componente nuevo, `Buscador`, pinta el campo, el botón de borrar y el contador, y gestiona el teclado (Enter y Escape). No se añaden dependencias ni se tocan `angular.json` ni los `tsconfig`.

## Archivos y responsabilidades

### Datos (`src/app/datos/`, `.ts` puro, sin Angular — principio 3)

| Archivo | Acción | Responsabilidad | RF |
| --- | --- | --- | --- |
| `busqueda.ts` | crear | Normalización, palabras de búsqueda, coincidencia, filtrado y textos del contador y del mensaje sin resultados. Constante `LONGITUD_MAXIMA_BUSQUEDA = 50`. | RF-3, RF-8 a RF-11, RF-14, RF-15, RNF-6 |
| `busqueda.test.ts` | crear | Tests con `node:test` y `node:assert/strict`. | RNF-5 |

### Interfaz (`src/app/`)

| Archivo | Acción | Responsabilidad | RF |
| --- | --- | --- | --- |
| `buscador/buscador.ts` | crear | Componente `Buscador` (`app-buscador`): `texto = model<string>('')`, `contador = input<string \| null>(null)`, método público `borrar()` (vacía y enfoca), y gestión de Enter y Escape. | RF-1, RF-3 a RF-6, RF-12 a RF-14, RF-17 |
| `buscador/buscador.html` | crear | Etiqueta, campo, botón "Borrar búsqueda" y región del contador. | RF-1, RF-3 a RF-5, RF-12, RF-14, RF-17 |
| `buscador/buscador.css` | crear | Estilos del buscador con los tokens de `styles.css`; menos de 4 kB. | RF-5, RF-7, RNF-3, RNF-4 |
| `catalogo/catalogo.ts` | modificar | `texto = signal('')`, `resultado = computed(() => buscar(this.productos, this.texto()))`, `buscador = viewChild(Buscador)` y enlace de WhatsApp. | RF-8 a RF-11, RF-16, RF-20, RF-22, RF-23 |
| `catalogo/catalogo.html` | modificar | Pinta `<app-buscador>` encima de la cuadrícula y, según `resultado()`, la cuadrícula o el bloque sin resultados. | RF-1, RF-2, RF-8, RF-15, RF-16, RF-17, RF-18, RF-20 |
| `catalogo/catalogo.css` | modificar | Estilos del bloque sin resultados (texto largo partido en líneas, botones de 44 px). | RF-16, RF-21, RNF-3, RNF-4 |

### Otros

- `MEMORY.md`: estado y decisiones al terminar cada fase.
- Sin cambios en `productos.json`, `contacto.ts`, `tarjeta-producto`, `detalle-producto`, `pie-pagina`, `boton-whatsapp`, `angular.json`, `tsconfig*` ni `package.json`.

## Funciones puras (`busqueda.ts`)

```ts
export const LONGITUD_MAXIMA_BUSQUEDA = 50;

/** Minúsculas, sin marcas sobre las letras, todo lo que no sea a-z o 0-9 → espacio, espacios reducidos. */
export function normalizarTexto(texto: string): string;

/** Palabras del texto normalizado; [] si la búsqueda está vacía. */
export function palabrasDeBusqueda(texto: string): string[];

/** Nombre y descripción normalizados y unidos con un espacio. */
export function textoBuscable(producto: Producto): string;

/** true si el texto buscable contiene todas las palabras, en cualquier orden. */
export function coincide(textoBuscable: string, palabras: readonly string[]): boolean;

/** "1 producto" o "{n} productos". */
export function textoContador(cantidad: number): string;

/** 'No encontramos "{texto sin espacios al principio ni al final}". Escríbenos por WhatsApp y te ayudamos.' */
export function mensajeSinResultados(texto: string): string;

export interface ResultadoBusqueda {
  /** Productos que se pintan, en el mismo orden que la lista recibida. */
  productos: Producto[];
  /** null si la búsqueda está vacía o no hay resultados. */
  contador: string | null;
  /** null salvo cuando una búsqueda no vacía no tiene resultados. */
  sinResultados: string | null;
  /** id → posición (0, 1, 2…) en los resultados; los productos que no están no aparecen. */
  posiciones: ReadonlyMap<string, number>;
}

/** Filtra una lista ya ordenada sin cambiar su orden. */
export function buscar(productos: readonly Producto[], texto: string): ResultadoBusqueda;
```

`Producto` se importa con `import type { Producto } from './producto';`, sin extensión, como en `catalogo.ts` (Node lo elimina y Angular compila).

## Algoritmos (pseudocódigo)

### Normalizar (Definiciones → "Texto normalizado")

```
normalizarTexto(texto):
  t ← texto en minúsculas                          # Ñ → ñ, Á → á
  t ← descomponer t en forma NFD                   # á → a + ́
  t ← quitar de t las marcas diacríticas (\p{M})   # ñ → n, ç → c, ü → u
  t ← cambiar cada tramo de caracteres fuera de [a-z0-9] por un espacio
  devolver t sin espacios al principio ni al final
```

Como el paso 4 cambia los tramos enteros por un solo espacio, los espacios repetidos se reducen solos.

### Palabras y coincidencia (RF-8, RF-9, Definiciones)

```
palabrasDeBusqueda(texto):
  n ← normalizarTexto(texto)
  si n = "" → devolver []
  devolver n partido por " "

textoBuscable(p) ← normalizarTexto(p.nombre) + " " + normalizarTexto(p.descripcion)

coincide(textoBuscable, palabras):
  devolver cada palabra de palabras está contenida en textoBuscable
```

Como ninguna palabra tiene espacios y el nombre y la descripción se separan con un espacio, nunca hay coincidencias a caballo entre los dos.

### Buscar (RF-8 a RF-11, RF-14, RF-15)

```
buscar(productos, texto):
  palabras ← palabrasDeBusqueda(texto)
  si palabras está vacía:                                     # RF-9
    devolver { productos: copia de productos, contador: null, sinResultados: null }
  encontrados ← productos filtrados por coincide(textoBuscable(p), palabras)   # RF-8, RF-10, RF-11
  si encontrados está vacía:                                  # RF-15
    devolver { productos: [], contador: null, sinResultados: mensajeSinResultados(texto) }
  devolver { productos: encontrados, contador: textoContador(encontrados.length), sinResultados: null }   # RF-14
  (en los tres casos, posiciones ← mapa id → índice de cada producto de "productos" devuelto)   # RF-18, RF-20, RNF-1

textoContador(n)          ← n = 1 ? "1 producto" : n + " productos"
mensajeSinResultados(t)   ← 'No encontramos "' + t sin espacios al principio ni al final + '". Escríbenos por WhatsApp y te ayudamos.'
```

- `filter` conserva el orden de la lista que recibe, que es la de `ordenarPorPrecioDesc` (RF-10).
- Los productos se distinguen por objeto y no por nombre, así que dos "Calaca" con distinto precio salen los dos (RF-11).
- El mensaje usa el texto original sin normalizar (RF-15). Angular escapa la interpolación, así que `<b>` se ve tal cual.

## Interfaz

### `Catalogo` (estado y composición)

```
productos  ← ordenarPorPrecioDesc(datos)           (sin cambios)
texto      ← signal('')                            # en memoria: no se guarda (RF-23)
resultado  ← computed(buscar(productos, texto()))  # se recalcula solo cuando cambia el texto
buscador   ← viewChild(Buscador)
enlaceWhatsapp ← crearEnlaceWhatsapp(NUMERO_WHATSAPP, MENSAJE_WHATSAPP)   # el mismo del botón fijo (RF-16)
verTodos() ← buscador()?.borrar()                  # vacía y devuelve el foco al campo (RF-16)
```

Plantilla (estructura):

```
@if (productos.length > 0) {                               # RF-2
  <app-buscador [(texto)]="texto" [contador]="resultado().contador" />   # RF-1, RF-14
  <div aria-live="polite">                                  # siempre en el DOM (RF-17)
    @if (resultado().sinResultados; as mensaje) { <p class="sin-resultados">{{ mensaje }}</p> }   # RF-15
  </div>
  @if (resultado().sinResultados) {
    <div class="acciones">
      <a [href]="enlaceWhatsapp" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>
      <button type="button" (click)="verTodos()">Ver todos los productos</button>
    </div>                                                  # RF-16
  }
  # La cuadrícula y sus 64 tarjetas se crean una vez y nunca se destruyen (RNF-1):
  <ul class="cuadricula" [hidden]="resultado().sinResultados !== null">
    @for (p of productos; track p.id) {                     # el catálogo completo, no los resultados
      @let posicion = resultado().posiciones.get(p.id);
      <li [hidden]="posicion === undefined">                # RF-8: se ocultan las que no coinciden
        <app-tarjeta-producto … [prioritaria]="posicion !== undefined && posicion < 8" />   # RF-20
      </li>
    }
  </ul>                                                     # RF-8, RF-10, RF-18
} @else { mensaje de catálogo vacío (spec 001, RF-29) }
detalle (sin cambios: RF-22)
```

- **RF-18:** la cuadrícula actual ya cumple. A 2 y 3 columnas las pistas son fijas, y desde 1024 px `auto-fill` conserva las pistas vacías, así que las tarjetas mantienen su tamaño y quedan a la izquierda. El pie de página ya va después de `main`.
- **RF-19:** no se llama a ningún método de desplazamiento. Lo que cambia está debajo del campo, así que el anclaje de desplazamiento del navegador no mueve la vista.
- **RF-8 y RF-10:** se recorre el catálogo completo, que ya viene ordenado, y se ocultan con `hidden` las tarjetas que no coinciden. Las visibles quedan en el mismo orden que los resultados.
- **RF-20:** `prioritaria` se calcula con la posición en los resultados (`posiciones`), así que las 8 primeras pasan a `loading="eager"`. Las tarjetas ocultas tienen `display: none`, y el navegador no pide fotos `lazy` que no se muestran.
- **CSS:** `.cuadricula` usa `display: grid`, que anula el `hidden` del navegador, así que hace falta `.cuadricula[hidden] { display: none; }`. Los `<li>` no tienen `display` propio, así que su `hidden` funciona sin más.
- **RF-21:** el bloque sin resultados va dentro de `main`, que conserva su margen inferior, y el pie de página mantiene el margen de RF-35 de la spec 001.
- **RF-22:** el texto sigue en la `signal` mientras el detalle está abierto. Al cerrar, `cerrar()` encuentra la tarjeta porque sigue en los resultados.

### `Buscador`

```
<div class="buscador" role="search">
  <label for="busqueda">Buscar productos</label>                      # RF-1
  <div class="campo-con-boton">
    <input #campo id="busqueda" type="text"
           [value]="texto()" (input)="texto.set(valor del campo)"     # RF-8, cada cambio, también los intermedios
           maxlength="50"                                               # RF-3 (LONGITUD_MAXIMA_BUSQUEDA)
           placeholder="Ej.: bruja, dinosaurio"                         # RF-1
           autocomplete="off" autocapitalize="off" spellcheck="false"  # RF-4
           enterkeyhint="search"
           (keydown.enter)="al pulsar Enter"                            # RF-6
           (keydown.escape)="al pulsar Escape" />                       # RF-13
    @if (texto().length > 0) {                                          # RF-12: "algún carácter", sin normalizar
      <button type="button" aria-label="Borrar búsqueda" (click)="borrar()">×</button>
    }
  </div>
  <p class="contador" role="status">{{ contador() ?? '' }}</p>          # RF-14, RF-17: siempre en el DOM
</div>

borrar():         texto.set(''); campo.focus()                         # RF-12, RF-16
al pulsar Enter:  si no se está componiendo un carácter (isComposing) → campo.blur()   # RF-6
al pulsar Escape: si texto() ≠ '' → evitar la acción por defecto; borrar()            # RF-13
```

- Al no haber `<form>`, Enter no envía nada ni recarga la página (RF-6).
- **CSS:**
  - Campo de 44 px de alto como mínimo, con `font-size: 16px` y borde `--borde`.
  - Fondo `--superficie`, texto `--tinta` y texto de ejemplo `--tinta-suave` (unos 7:1 sobre blanco).
  - `padding-right` para el botón de borrar, que es de 44 × 44 px y va posicionado dentro del campo.
  - `width: 100%` con `max-width` para que no haya scroll horizontal desde 320 px.
  - Foco con el `:focus-visible` global (RNF-3, RNF-4).
  - El buscador va en el flujo normal de la página, sin `position: sticky` (RF-7).
- **Bloque sin resultados (CSS de `Catalogo`):** el texto usa `overflow-wrap: anywhere` para partir 50 caracteres sin espacios (RNF-4). Los dos botones miden 44 px de alto como mínimo, y en anchos estrechos van uno debajo del otro.

## Decisiones (y alternativa descartada)

1. **Toda la lógica en `busqueda.ts`, y el componente solo recibe `ResultadoBusqueda`.** Así se cumplen el principio 3 y RNF-6, y se testea sin Angular. *Descartada:* filtrar con un `computed` dentro del componente, porque el componente filtraría (principio 3) y la lógica no se podría testear con `node --test`.
2. **Normalizar con `toLowerCase` + `normalize('NFD')` + quitar `\p{M}` + `[^a-z0-9]+` → espacio.** Es nativo, no necesita tablas y cubre `ñ`, `ç` y cualquier tilde. *Descartada:* una tabla de reemplazos a mano (`á→a`…), porque se olvidan casos (`à`, `â`, `Ñ`).
3. **Recalcular el texto buscable en cada búsqueda.** Con 64 productos tarda menos de 1 ms, muy por debajo de los 100 ms de RNF-1. *Descartada:* precalcular un índice al cargar, que añade estado y código sin beneficio medible. Si el catálogo creciera mucho, se precalcularía en `Catalogo` con un segundo `computed`.
4. **`<input type="text">` con `enterkeyhint="search"` dentro de `role="search"`.** Así no aparece el botón de borrar del navegador (RF-5), no hay un Escape nativo que choque con RF-13 y el teclado del móvil muestra la tecla "Buscar". *Descartada:* `type="search"`, que obliga a ocultar con CSS el `::-webkit-search-cancel-button` y se comporta distinto en cada navegador.
5. **Enlace a mano (`[value]` + `(input)`) en vez de `ngModel`.** No hace falta importar `FormsModule` y está alineado con el principio 1 (stack mínimo). *Descartada:* `FormsModule`/`ngModel`, que añade un módulo entero para un solo campo.
6. **`model()` para el texto y `viewChild` para `borrar()`.** El texto vive en `Catalogo`, que es quien calcula el resultado, y "Ver todos los productos" reutiliza el mismo `borrar()` (vaciar y enfocar). *Descartada:* un `output` de evento en `Buscador` y que `Catalogo` busque el campo con `document.querySelector`, que duplica lógica y acopla los componentes al DOM.
7. **Límite de 50 caracteres con `maxlength` en el campo.** Cubre lo que se escribe y lo que se pega, sin avisos (RF-3). *Descartada:* recortar el texto en `buscar()`, porque el campo mostraría un texto distinto del que se busca.
8. **Anuncios con regiones vivas siempre presentes en el DOM** (`role="status"` para el contador y `aria-live="polite"` para el mensaje sin resultados). Los lectores de pantalla solo anuncian los cambios dentro de regiones que ya existían. *Descartada:* una región oculta que duplique los textos, porque se leerían dos veces.
9. **Reutilizar `crearEnlaceWhatsapp(NUMERO_WHATSAPP, MENSAJE_WHATSAPP)` y los mismos `target="_blank" rel="noopener noreferrer"` del botón fijo** (RF-16). *Descartada:* exportar el enlace desde `BotonWhatsapp`, que es un componente.
10. **Crear todas las tarjetas una vez y ocultar las que no coinciden** (cambio tras medir RNF-1 en T8). Con el build de producción, a 375 px y con la CPU 4×, volver a crear las tarjetas tardaba entre 129 y 209 ms al volver al catálogo completo o al buscar una letra. Ocultar y mostrar las ya creadas tarda entre 30 y 50 ms. El componente no filtra: solo lee `posiciones`, que calcula `buscar()` (principio 3). *Descartada:* recorrer `resultado().productos` y que Angular cree y destruya tarjetas, que no cumple RNF-1. *Descartada también:* subir el límite de RNF-1 en la spec.

## Estrategia de tests (`node --test`)

Archivo `src/app/datos/busqueda.test.ts`, que importa `./busqueda.ts` y `./catalogo.ts` con extensión. Reutiliza el patrón `producto(nombre, precio, descripcion = '')` de `catalogo.test.ts`.

| Test | RF / RNF |
| --- | --- |
| `normalizarTexto`: `"GRÍNCH"`→`"grinch"`, `"Niño"`→`"nino"`, `"Ñandú"`→`"nandu"`, `"Façade"`→`"facade"`, `"spider-man"`→`"spider man"`, `"  a   b  "`→`"a b"`, saltos de línea → espacio, `"🎃bruja!"`→`"bruja"` | Definiciones, RNF-5 |
| `palabrasDeBusqueda`: `""`, `"   "`, `"-"`, `"\"."` y `"🎃"` → `[]`; `"Dino  Peque"` → `["dino", "peque"]` | RF-9, RNF-5 |
| `coincide`: todas las palabras en cualquier orden; fragmento (`bru` → "Bruja"); falta una palabra → `false`; no coincide a caballo entre el nombre y la descripción (`"ab"` con nombre "xa" y descripción "by" → `false`) | RF-8, Definiciones |
| Una palabra en el nombre y otra en la descripción → coincide | Definiciones |
| `buscar` con búsqueda vacía → todos los productos, en el mismo orden, con `contador` y `sinResultados` a `null` | RF-9 |
| `buscar` conserva el orden de `ordenarPorPrecioDesc` | RF-10 |
| Dos "Calaca" (Bs. 95 y Bs. 50) → los dos, el de 95 primero | RF-11 |
| `spiderman` no encuentra "Spider man"; `spider-man` sí | Casos límite |
| `90` no encuentra un producto de precio 90 cuyo nombre no lleva "90" | Casos límite |
| Sin resultados → `productos: []`, `contador: null` y `sinResultados` con el texto original sin espacios al principio ni al final (`"  <q>Ñzz  "` → `No encontramos "<q>Ñzz". …`) | RF-15 |
| `textoContador(1)` → `"1 producto"`; `textoContador(12)` → `"12 productos"` | RF-14 |
| `buscar` no modifica la lista recibida | RNF-6 |
| `posiciones`: con búsqueda vacía, cada id con su índice en el catálogo; con resultados, solo los ids de los resultados con 0, 1, 2…; sin resultados, vacío | RF-8, RF-20, RNF-1 |

Todo lo de interfaz se comprueba con Chrome DevTools a 375 px y en escritorio:

- RF-1 a RF-7, RF-12, RF-13, RF-16 a RF-22.
- RNF-1: CPU ralentizada 4×.
- RNF-2: en la pestaña de red, escribir no lanza más peticiones que fotos.
- RNF-3: contraste y tamaños.
- RNF-4: 320 px con 50 caracteres sin espacios.

Al final, `node --test` (spec 001 + 002) y `npm run build` sin avisos de presupuesto nuevos.

## Riesgos

- **Aviso NG0913 de Angular (imagen LCP sin prioridad):** el LCP solo se mide hasta la primera interacción, así que filtrar no debería provocarlo. Se comprueba en la consola al validar.
- **Anuncios en cada tecla:** con `aria-live="polite"` el lector de pantalla puede encadenar varios contadores seguidos mientras se escribe. Se acepta; si molesta, se plantearía en otra spec retrasar el anuncio.
- **Presupuesto de CSS (4 kB por componente):** `catalogo.css` crece con el bloque sin resultados. Hay que comprobar el tamaño en el build.
