// Secciones del catálogo: pestañas Navidad y Disfraces (spec 003).
import type { Producto } from './producto';

/** Unión de textos y no enum: node --test solo elimina los tipos. */
export type Seccion = 'navidad' | 'disfraces';

/** Pestañas en el orden en que se muestran (RF-4). */
export const SECCIONES: readonly { id: Seccion; etiqueta: string }[] = [
  { id: 'navidad', etiqueta: 'Navidad' },
  { id: 'disfraces', etiqueta: 'Disfraces' },
];

/** Carpetas de origen y su sección. La generación lee las mismas carpetas (RF-1). */
const SECCION_POR_ORIGEN: Readonly<Record<string, Seccion>> = {
  primera_salida: 'disfraces',
  segunda_salida: 'disfraces',
  tercera_salida: 'navidad',
};

export const ORIGENES: readonly string[] = Object.keys(SECCION_POR_ORIGEN);

/** Sección según la carpeta de origen; null si el origen no es ninguno de los conocidos (RF-2). */
export function seccionDeOrigen(origen: string): Seccion | null {
  return Object.hasOwn(SECCION_POR_ORIGEN, origen) ? SECCION_POR_ORIGEN[origen] : null;
}

/** Productos de una sección, en el mismo orden que la lista recibida (RF-9). */
export function productosDeSeccion(productos: readonly Producto[], seccion: Seccion): Producto[] {
  return productos.filter((p) => seccionDeOrigen(p.origen) === seccion);
}

/** Número de productos de cada sección, para el resumen de la generación (RF-3). */
export function contarPorSeccion(productos: readonly Producto[]): Record<Seccion, number> {
  const cuenta: Record<Seccion, number> = { navidad: 0, disfraces: 0 };
  for (const producto of productos) {
    const seccion = seccionDeOrigen(producto.origen);
    if (seccion) cuenta[seccion]++;
  }
  return cuenta;
}

/** Pestaña a la que llevan las flechas, Inicio y Fin; null con cualquier otra tecla (RF-8). */
export function pestanaSiguiente(actual: Seccion, tecla: string): Seccion | null {
  const indice = SECCIONES.findIndex((s) => s.id === actual);
  const total = SECCIONES.length;
  switch (tecla) {
    case 'ArrowRight':
      return SECCIONES[(indice + 1) % total].id;
    case 'ArrowLeft':
      return SECCIONES[(indice - 1 + total) % total].id;
    case 'Home':
      return SECCIONES[0].id;
    case 'End':
      return SECCIONES[total - 1].id;
    default:
      return null;
  }
}
