# Plan 003 — Pestañas Navidad y Disfraces

Spec: [`spec.md`](spec.md) (aprobada) · Estado: aprobado. Cumple `docs/constitution.md` sin enmiendas.

## Visión general

Tres piezas, sin dependencias nuevas y sin cambiar el formato de `productos.json`:

1. **Datos** (`.ts` puro): un archivo nuevo, `secciones.ts`, que deduce la sección de cada producto a partir de su `origen`, filtra los productos de una sección y resuelve la navegación con el teclado entre pestañas. La búsqueda sigue siendo `buscar()` de la spec 002, aplicada a los productos de la sección.
2. **Generación**: `tercera_salida` se añade a la lista de carpetas de origen, que pasa a vivir en `secciones.ts` para que la generación y la página compartan una sola fuente. El resumen gana la línea por sección.
3. **Interfaz**: un componente nuevo, `Pestanas`, pinta el `tablist`. `Catalogo` guarda la pestaña activa en una `signal` y sigue creando todas las tarjetas una sola vez y ocultando con `hidden` las que no son visibles (la técnica de la spec 002). Se corrige el orden de los atributos de la foto de la tarjeta para que las tarjetas ocultas no pidan su foto.

```
../primera_salida ─┐
../segunda_salida ─┼─► npm run catalogo ─► productos.json (sin cambios de formato)
../tercera_salida ─┘                              │
                                                  ▼
   productosDeSeccion(productos, seccion) ─► buscar(deSeccion, texto) ─► Catalogo ─► Pestanas + Buscador + cuadrícula
```

## Archivos y responsabilidades

### Datos (`src/app/datos/`, `.ts` puro, sin Angular — principio 3)

| Archivo             | Acción | Responsabilidad                                                                                                                                                                                                                       | RF                                  |
| ------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `secciones.ts`      | crear  | Tipo `Seccion`, lista `SECCIONES` (id y etiqueta, en orden), `ORIGENES` (las tres carpetas de origen), `seccionDeOrigen()`, `productosDeSeccion()`, `contarPorSeccion()` y `pestanaSiguiente()`. Solo `import type` de `producto.ts`. | RF-2, RF-3, RF-4, RF-8, RF-9, RNF-4 |
| `secciones.test.ts` | crear  | Tests de todo lo anterior y de la combinación `productosDeSeccion()` + `buscar()` que usa la página.                                                                                                                                  | RF-11, RF-12, RF-14, RF-15, RNF-3   |

### Generación (`scripts/`)

| Archivo                     | Acción    | Responsabilidad                                                                                                                                                                                               | RF           |
| --------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `catalogo/carpetas.ts`      | modificar | Nueva función pura `origenesQueFaltan(origenes, esCarpeta)` → lista de las que faltan.                                                                                                                        | RF-1         |
| `catalogo/carpetas.test.ts` | modificar | Tests de `origenesQueFaltan()` (falta `tercera_salida`, faltan varias, no falta ninguna).                                                                                                                     | RF-1, RNF-3  |
| `catalogo/resumen.ts`       | modificar | `DatosResumen` gana `porSeccion: Record<Seccion, number>`; `crearResumen()` añade la línea `Navidad: {n} · Disfraces: {m}` justo después del total.                                                           | RF-3         |
| `catalogo/resumen.test.ts`  | modificar | Test de la nueva línea y de su posición (segunda línea).                                                                                                                                                      | RF-3, RNF-3  |
| `catalogo/fusion.test.ts`   | modificar | Test del caso límite "mover una carpeta de `segunda_salida` a `tercera_salida`": nace un producto nuevo y no es cambio de precio. Sin cambios en `fusion.ts`, que ya agrupa por origen.                       | Casos límite |
| `generar-catalogo.ts`       | modificar | Importa `ORIGENES` de `secciones.ts` (en lugar de su lista local), usa `origenesQueFaltan()` para la detención y rellena `porSeccion` con `contarPorSeccion()`. Comentario de cabecera con las tres carpetas. | RF-1, RF-3   |

`validacion.ts` no cambia: solo comprueba que `origen` sea texto, así que el `productos.json` actual sigue siendo válido.

### Interfaz (`src/app/`)

| Archivo                                  | Acción               | Responsabilidad                                                                                                                                                                                                                                                                                                       | RF                                            |
| ---------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `pestanas/pestanas.ts`                   | crear                | Componente `Pestanas` (`app-pestanas`): `seleccionada = model.required<Seccion>()`, `controla = input.required<string>()` (id del panel). Gestiona clic, Enter/Espacio (nativos del `<button>`) y flechas/Inicio/Fin con `pestanaSiguiente()`, y lleva el foco a la pestaña nueva con `preventScroll`.                | RF-4, RF-6, RF-7, RF-8, RF-10, RF-17          |
| `pestanas/pestanas.html`                 | crear                | `<div role="tablist" aria-label="Secciones del catálogo">` con un `<button role="tab">` por sección: `id`, `aria-selected`, `aria-controls` y `tabindex` 0 en la activa y -1 en la otra.                                                                                                                              | RF-4, RF-7, RF-8                              |
| `pestanas/pestanas.css`                  | crear                | Dos pestañas de al menos 44 px, texto de 16 px; activa en negrita con una línea inferior de 3 px; mitad del ancho cada una por debajo de 600 px; tokens de `styles.css`. Menos de 4 kB. Sin `position: sticky`.                                                                                                       | RF-7, RF-10, RNF-1, RNF-2                     |
| `catalogo/catalogo.ts`                   | modificar            | `seccion = signal<Seccion>('navidad')`; `deSeccion = computed(() => productosDeSeccion(this.productos, this.seccion()))`; `resultado` pasa a `computed(() => buscar(this.deSeccion(), this.texto()))`; `seccionVacia = computed(() => this.deSeccion().length === 0)`.                                                | RF-5, RF-6, RF-9, RF-14, RF-15, RF-17, RF-18  |
| `catalogo/catalogo.html`                 | modificar            | Pinta `<app-pestanas>` y un panel `role="tabpanel"` con el buscador, la región `aria-live`, las acciones y la cuadrícula. Con la sección vacía oculta el buscador y la cuadrícula con `hidden` y muestra el mensaje de sección vacía dentro de la región `aria-live`. El botón pasa a llamarse "Ver toda la sección". | RF-4, RF-9, RF-11, RF-12, RF-13, RF-15, RF-16 |
| `catalogo/catalogo.css`                  | modificar            | Regla `[hidden]` para el contenedor del buscador si su `display` la anula, y estilo del mensaje de sección vacía (texto que se parte en líneas). Debe seguir por debajo de 4 kB (hoy 1,4 kB).                                                                                                                         | RF-12, RNF-2                                  |
| `tarjeta-producto/tarjeta-producto.html` | **sin cambios** (T5) | Se pensaba poner `[attr.loading]` antes de `[src]`. Medido en T5 y T7: la plantilla actual ya pide solo las fotos visibles, así que no se toca.                                                                                                                                                                       | RF-11                                         |

### Otros

- `specs/003-pestanas-temporada/tasks.md`: en la fase siguiente.
- `MEMORY.md`: estado y decisiones al terminar cada fase.
- Sin cambios en `productos.json` (salvo regenerarlo con `npm run catalogo`), `producto.ts`, `busqueda.ts`, `buscador/`, `detalle-producto/`, `app.*`, `angular.json`, `tsconfig*` ni `package.json`.

## Funciones puras (`secciones.ts`)

```ts
import type { Producto } from './producto';

/** Unión de textos, no enum: node --test solo elimina tipos. */
export type Seccion = 'navidad' | 'disfraces';

/** Orden de las pestañas (RF-4). */
export const SECCIONES: readonly { id: Seccion; etiqueta: string }[] = [
  { id: 'navidad', etiqueta: 'Navidad' },
  { id: 'disfraces', etiqueta: 'Disfraces' },
];

/** Carpetas de origen y su sección (spec 003, Definiciones). La generación lee las claves. */
const SECCION_POR_ORIGEN: Readonly<Record<string, Seccion>> = {
  primera_salida: 'disfraces',
  segunda_salida: 'disfraces',
  tercera_salida: 'navidad',
};
export const ORIGENES: readonly string[] = Object.keys(SECCION_POR_ORIGEN);

export function seccionDeOrigen(origen: string): Seccion | null; // RF-2
export function productosDeSeccion(productos, seccion): Producto[]; // RF-9 (conserva el orden)
export function contarPorSeccion(productos): Record<Seccion, number>; // RF-3

/** Pestaña a la que llevan las flechas, Inicio y Fin; null para cualquier otra tecla (RF-8). */
export function pestanaSiguiente(actual: Seccion, tecla: string): Seccion | null;
```

## Algoritmos

### Sección de un producto (RF-2)

```
seccionDeOrigen(origen):
  devolver SECCION_POR_ORIGEN[origen] ?? null
```

Un `origen` desconocido devuelve `null` y el producto no aparece en ninguna pestaña. No puede ocurrir con catálogos generados, porque la generación solo lee `ORIGENES`.

### Productos visibles (RF-9, RF-11, RF-12, RF-14, RF-15)

```
productosDeSeccion(productos, seccion):
  devolver productos filtrados por seccionDeOrigen(p.origen) = seccion     // mismo orden

En Catalogo (tres computed, sin lógica propia):
  deSeccion    ← productosDeSeccion(productosOrdenados, seccion())
  resultado    ← buscar(deSeccion, texto())      // contador, sin resultados y posiciones de la spec 002
  seccionVacia ← deSeccion está vacía
```

Como `texto` vive en `Catalogo` y no depende de la sección, al cambiar de pestaña el mismo texto se aplica a la nueva sección (RF-15). Con la sección vacía, `buscar([], texto)` devuelve "sin resultados" si hay texto; la plantilla da prioridad a `seccionVacia` y no muestra ese mensaje.

### Recuento por sección (RF-3)

```
contarPorSeccion(productos):
  cuenta ← { navidad: 0, disfraces: 0 }
  para cada p: s ← seccionDeOrigen(p.origen); si s ≠ null → cuenta[s]++
  devolver cuenta
```

### Teclado de las pestañas (RF-8)

```
pestanaSiguiente(actual, tecla):
  i ← índice de actual en SECCIONES;  n ← |SECCIONES|
  ArrowRight → SECCIONES[(i + 1) mod n]
  ArrowLeft  → SECCIONES[(i - 1 + n) mod n]
  Home       → SECCIONES[0]
  End        → SECCIONES[n - 1]
  otra       → null
```

### Carpetas de origen que faltan (RF-1)

```
origenesQueFaltan(origenes, esCarpeta):
  devolver origenes filtrados por no esCarpeta(origen)
```

`generar-catalogo.ts` la llama con `ORIGENES` y una función que mira el disco; si la lista no está vacía, falla con todas las que faltan antes de escribir nada.

## Interfaz

### Estructura de la página

```
<header> (sin cambios: logo, "Disfraces y accesorios", bajada)
<main>
  @if hay productos en el catálogo
    <app-pestanas [(seleccionada)]="seccion" controla="panel-catalogo" />
    <div id="panel-catalogo" role="tabpanel" [attr.aria-labelledby]="'pestana-' + seccion()">
      <div [hidden]="seccionVacia()">  <app-buscador …/>  </div>
      <div aria-live="polite">                             ← una sola región para los dos mensajes (RF-16)
        @if seccionVacia → <p>Todavía no hay productos en esta sección…</p>
        @else if sinResultados → <p>No encontramos "…"…</p>
      </div>
      @if !seccionVacia y sinResultados → acciones: "Escribir por WhatsApp" · "Ver toda la sección"
      <ul class="cuadricula" [hidden]="seccionVacia o sinResultados">
        @for producto of TODOS los productos (track id)
          <li [hidden]="no está en posiciones"> <app-tarjeta-producto [prioritaria]="posición < 8" …/>
    </div>
  @else
    mensaje de catálogo vacío (spec 001, RF-29)                                        (RF-13)
</main>
```

### Comportamiento

- **Pestaña inicial (RF-5, RF-18):** `signal<Seccion>('navidad')` en memoria; no se lee ni escribe nada en la dirección ni en el almacenamiento.
- **Cambio de pestaña (RF-6, RF-10):** `Pestanas` actualiza el `model`; `deSeccion` y `resultado` se recalculan y solo cambian atributos `hidden`, sin recrear tarjetas ni desplazar la página. El foco se mueve con `focus({ preventScroll: true })` y solo cuando el cambio viene del teclado (con el clic, el navegador ya enfoca el botón).
- **Fotos (RF-11):** solo las tarjetas visibles pueden ser `prioritaria` (posición < 8 en los resultados de la sección). Las ocultas están dentro de un `<li hidden>` (`display: none`) y con `loading="lazy"`, que el navegador no descarga; para ello `loading` debe aplicarse antes que `src` (cambio en `tarjeta-producto.html`).
- **Buscador oculto (RF-15):** se oculta con `hidden` en lugar de `@if`, así que el campo conserva su texto y su estado. El texto, además, vive en la `signal` de `Catalogo`.
- **Lectores de pantalla (RF-7, RF-16):** `role="tab"` con `aria-selected`; el panel lleva `aria-labelledby` con la pestaña activa. El contador ya está en `role="status"` (spec 002) y los dos mensajes comparten la región `aria-live`, que siempre está en el DOM.
- **Detalle y borrar (RF-17):** `abierto` y `seccion` son `signals` independientes; `verTodos()` solo vacía el texto. `Pestanas` no escucha Escape.

## Decisiones

| Decisión                                                                                                                                                         | Alternativa descartada y por qué                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Deducir la sección del campo `origen` que ya existe.                                                                                                             | Añadir un campo `seccion` al JSON: cambiaría el formato de los datos (hay que pedir permiso), obligaría a migrar el catálogo actual y a validar el campo. La spec lo descarta (RF-2).                                                                                                                                          |
| `ORIGENES` y su sección en `secciones.ts`, importados por la generación.                                                                                         | Mantener la lista en `generar-catalogo.ts` y otra tabla en la página: dos fuentes que pueden desincronizarse. La generación ya importa de `src/app/datos/` (`producto.ts`, `catalogo.ts`).                                                                                                                                     |
| Combinar sección y búsqueda con `computed` en `Catalogo` que llaman a funciones puras.                                                                           | Una función `vistaCatalogo()` en `secciones.ts` que llame a `buscar()`: la app no admite imports con extensión `.ts` (haría falta `allowImportingTsExtensions` en `tsconfig`, que hay que pedir) y `node --test` los exige para importar valores. El componente no filtra: solo encadena dos funciones probadas (principio 3). |
| Ocultar con `hidden` (tarjetas y buscador) y crear todas las tarjetas una vez.                                                                                   | Pintar solo las de la sección con `@for` sobre la lista filtrada: recrear tarjetas tardaba hasta 209 ms en la spec 002 y rompería RNF-5; con `@if` en el buscador se perdería su estado.                                                                                                                                       |
| Un componente `Pestanas` propio con `role="tablist"` y `tabindex` itinerante.                                                                                    | Enrutar con dos rutas (`/navidad`, `/disfraces`): cambia la dirección, que la spec deja fuera de alcance, y añade routing. Usar una librería de pestañas: dependencia nueva (principio 1).                                                                                                                                     |
| Activación automática con las flechas (RF-8).                                                                                                                    | Activación manual (flecha mueve el foco, Enter activa): más pulsaciones; con dos pestañas no hay coste de activar al moverse.                                                                                                                                                                                                  |
| No tocar la tarjeta: la plantilla actual ya pide solo las fotos visibles (medido en T5 y T7 en un contexto aislado: al abrir, el logo y las 8 fotos de Navidad). | Poner `loading` antes que `src` o pasar a la tarjeta una entrada `visible`: innecesario.                                                                                                                                                                                                                                       |
| `origenesQueFaltan()` pura y probada.                                                                                                                            | Dejar la comprobación dentro de `generar-catalogo.ts`: no se podría testear sin tocar el disco, y RNF-3 exige test de la detención.                                                                                                                                                                                            |

## Estrategia de tests (`node --test`)

Todos los tests en `.ts` puros, con `node:test` y `node:assert/strict`, e imports relativos con extensión `.ts`. Productos de prueba creados con una función auxiliar en cada test, sin leer `productos.json`.

| Archivo             | Casos                                                                                                                                                                                                                                                                                                                                               | RF                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `secciones.test.ts` | `seccionDeOrigen`: las tres carpetas y un origen desconocido (`null`). `ORIGENES` contiene exactamente las tres. `SECCIONES` en orden Navidad, Disfraces.                                                                                                                                                                                           | RF-2, RF-4                 |
|                     | `productosDeSeccion`: conserva el orden recibido (precio desc.); `350_grinch` en `segunda_salida` y en `tercera_salida` sale uno en cada sección; las tres "Sorpresas navideñas" (8, 40, 45) salen las tres.                                                                                                                                        | RF-9, casos límite         |
|                     | `contarPorSeccion`: cuenta por sección, suma el total e ignora orígenes desconocidos; catálogo vacío → `{0, 0}`.                                                                                                                                                                                                                                    | RF-3                       |
|                     | `buscar(productosDeSeccion(…), texto)` (la combinación que usa `Catalogo`): búsqueda vacía → todos los de la sección; "grinch" en cada sección → solo el suyo y contador "1 producto"; texto que solo coincide en la otra sección → mensaje sin resultados; sección vacía → lista vacía; las `posiciones` no incluyen productos de la otra sección. | RF-11, RF-12, RF-14, RF-15 |
|                     | `pestanaSiguiente`: derecha y izquierda con vuelta desde los extremos, Inicio, Fin, y `null` con `Enter`, `Tab` y `Escape`.                                                                                                                                                                                                                         | RF-8, RF-17                |
| `carpetas.test.ts`  | `origenesQueFaltan`: falta `tercera_salida` → `['tercera_salida']`; faltan dos; no falta ninguna → `[]`.                                                                                                                                                                                                                                            | RF-1                       |
| `resumen.test.ts`   | La segunda línea del resumen es `Navidad: 8 · Disfraces: 64`; con ceros, `Navidad: 0 · Disfraces: 0`.                                                                                                                                                                                                                                               | RF-3                       |
| `fusion.test.ts`    | Desaparece `segunda_salida/150_elf` y aparece `tercera_salida/150_elf`: producto nuevo con nombre por defecto y descripción vacía, sin cambio de precio.                                                                                                                                                                                            | Casos límite               |

Los RF de interfaz (RF-4 a RF-8, RF-10 a RF-13, RF-16, RF-17, RNF-1, RNF-2, RNF-5) se comprueban con Chrome DevTools en escritorio y a 375 px (`emulate 375x812x2,mobile,touch`, `ng serve --port 4300`):

- Pestañas, foco, flechas, Inicio/Fin y árbol de accesibilidad (`take_snapshot`).
- Lista de red al abrir: ninguna foto de `fotos/primera_salida/` ni `fotos/segunda_salida/` (RF-11).
- Cambio de pestaña con CPU 4× y `ng serve --configuration production`: menos de 100 ms (RNF-5).
- Consola sin errores ni avisos nuevos; `npm run build` sin avisos de presupuesto.

## Cobertura de RF

| RF            | Dónde                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| RF-1          | `ORIGENES` (`secciones.ts`), `origenesQueFaltan()`, `generar-catalogo.ts`                                 |
| RF-2          | `seccionDeOrigen()`                                                                                       |
| RF-3          | `contarPorSeccion()`, `crearResumen()`                                                                    |
| RF-4          | `SECCIONES`, `Pestanas`, `catalogo.html`                                                                  |
| RF-5, RF-18   | `seccion = signal('navidad')` en `Catalogo`                                                               |
| RF-6          | `Pestanas` (`model`), `deSeccion` y `resultado` en `Catalogo`                                             |
| RF-7          | `pestanas.html` (roles y `aria-selected`), `pestanas.css`, `tabpanel` en `catalogo.html`                  |
| RF-8          | `pestanaSiguiente()`, `Pestanas`                                                                          |
| RF-9          | `productosDeSeccion()` sobre la lista ya ordenada; mismas tarjetas y cuadrícula                           |
| RF-10         | `pestanas.css` (sin `sticky`), `hidden` sin recrear, `preventScroll`                                      |
| RF-11         | `posiciones` de `buscar()` sobre la sección, `prioritaria` y `loading="lazy"` de la tarjeta (sin cambios) |
| RF-12         | `seccionVacia` en `Catalogo`, `catalogo.html`, `catalogo.css`                                             |
| RF-13         | `@else` existente en `catalogo.html`                                                                      |
| RF-14         | `buscar(deSeccion(), texto())` en `Catalogo`                                                              |
| RF-15         | `texto` en `Catalogo` + buscador oculto con `hidden`                                                      |
| RF-16         | Región `aria-live` compartida y `role="status"` del contador                                              |
| RF-17         | `signals` independientes; `Pestanas` ignora Escape                                                        |
| RNF-1 a RNF-6 | `pestanas.css`, `catalogo.css`, tests de la tabla, `secciones.ts` puro, comprobación en DevTools          |
