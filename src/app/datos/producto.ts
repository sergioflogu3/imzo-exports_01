// Un producto del catálogo. Las claves coinciden con las de productos.json.
export interface Producto {
  /** "<origen>/<carpeta>", p. ej. "segunda_salida/90_mario". */
  id: string;
  origen: string;
  carpeta: string;
  /** Editable a mano: la generación lo conserva. */
  nombre: string;
  /** Bolivianos, entero. */
  precio: number;
  /** Editable a mano: la generación lo conserva. */
  descripcion: string;
  fotografia_principal: string;
  /** Todas las fotos, con la principal en primer lugar. */
  fotografias: string[];
}
