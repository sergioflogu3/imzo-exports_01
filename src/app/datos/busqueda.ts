// Búsqueda de productos por texto (spec 002).
import type { Producto } from './producto';

/** Caracteres que admite el campo de búsqueda (RF-3). */
export const LONGITUD_MAXIMA_BUSQUEDA = 50;

/** Minúsculas, sin tildes ni otras marcas, y todo lo que no sea a-z o 0-9 cambiado por un espacio. */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Palabras del texto normalizado; vacío si la búsqueda está vacía (RF-9). */
export function palabrasDeBusqueda(texto: string): string[] {
  const normalizado = normalizarTexto(texto);
  return normalizado ? normalizado.split(' ') : [];
}

/** Nombre y descripción normalizados, separados por un espacio para no unir sus palabras. */
export function textoBuscable(producto: Producto): string {
  return `${normalizarTexto(producto.nombre)} ${normalizarTexto(producto.descripcion)}`;
}

/** true si el texto buscable contiene todas las palabras, en cualquier orden (RF-8). */
export function coincide(textoBuscable: string, palabras: readonly string[]): boolean {
  return palabras.every((palabra) => textoBuscable.includes(palabra));
}

/** "1 producto" o "{n} productos" (RF-14). */
export function textoContador(cantidad: number): string {
  return cantidad === 1 ? '1 producto' : `${cantidad} productos`;
}

/** Mensaje con el texto tal como se escribió, sin espacios en los extremos (RF-15). */
export function mensajeSinResultados(texto: string): string {
  return `No encontramos "${texto.trim()}". Escríbenos por WhatsApp y te ayudamos.`;
}

export interface ResultadoBusqueda {
  /** Productos que se pintan, en el mismo orden que la lista recibida. */
  productos: Producto[];
  /** null si la búsqueda está vacía o no hay resultados. */
  contador: string | null;
  /** null salvo cuando una búsqueda no vacía no tiene resultados. */
  sinResultados: string | null;
  /**
   * id → posición en los resultados; los productos que no están no aparecen. Permite
   * ocultar tarjetas en lugar de recrearlas (RNF-1).
   */
  posiciones: ReadonlyMap<string, number>;
}

/** Filtra una lista ya ordenada sin cambiar su orden (RF-8 a RF-11, RF-14, RF-15). */
export function buscar(productos: readonly Producto[], texto: string): ResultadoBusqueda {
  const palabras = palabrasDeBusqueda(texto);
  if (palabras.length === 0) {
    return resultado([...productos], null, null);
  }
  const encontrados = productos.filter((p) => coincide(textoBuscable(p), palabras));
  if (encontrados.length === 0) {
    return resultado([], null, mensajeSinResultados(texto));
  }
  return resultado(encontrados, textoContador(encontrados.length), null);
}

function resultado(
  productos: Producto[],
  contador: string | null,
  sinResultados: string | null,
): ResultadoBusqueda {
  const posiciones = new Map(productos.map((p, i) => [p.id, i]));
  return { productos, contador, sinResultados, posiciones };
}
