import type { Producto } from './producto';

const colador = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

/** Orden alfabético de la spec: sin mayúsculas ni tildes, con números en orden natural. */
export function compararTexto(a: string, b: string): number {
  return colador.compare(a, b);
}

/** Del más caro al más barato; a igual precio, por nombre (RF-17). */
export function ordenarPorPrecioDesc(productos: readonly Producto[]): Producto[] {
  return [...productos].sort((a, b) => b.precio - a.precio || compararTexto(a.nombre, b.nombre));
}

export function formatearPrecio(precio: number): string {
  return `Bs. ${precio}`;
}
