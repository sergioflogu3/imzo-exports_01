// Comprueba el formato de productos.json antes de fusionarlo (RF-15).
import type { Producto } from '../../src/app/datos/producto.ts';

const CAMPOS_TEXTO = ['id', 'origen', 'carpeta', 'nombre', 'descripcion', 'fotografia_principal'];

/** Devuelve la lista de errores con su posición, o una lista vacía si es válido. */
export function validarCatalogo(datos: unknown): string[] {
  if (!Array.isArray(datos)) return ['raíz: no es una lista'];

  const errores: string[] = [];
  const ids = new Set<string>();
  datos.forEach((elemento: unknown, i) => {
    if (typeof elemento !== 'object' || elemento === null || Array.isArray(elemento)) {
      errores.push(`[${i}]: no es un objeto`);
      return;
    }
    const producto = elemento as Record<string, unknown>;
    for (const campo of CAMPOS_TEXTO) {
      if (typeof producto[campo] !== 'string') errores.push(`[${i}].${campo}: no es texto`);
    }
    const precio = producto['precio'];
    if (typeof precio !== 'number' || !Number.isInteger(precio) || precio <= 0) {
      errores.push(`[${i}].precio: no es un entero mayor que 0`);
    }
    const fotos = producto['fotografias'];
    if (!Array.isArray(fotos) || !fotos.every((f) => typeof f === 'string')) {
      errores.push(`[${i}].fotografias: no es una lista de textos`);
    }
    const id = producto['id'];
    if (typeof id === 'string') {
      if (ids.has(id)) errores.push(`[${i}].id: repetido`);
      ids.add(id);
    }
  });
  return errores;
}

export function leerCatalogo(texto: string): { productos: Producto[] } | { errores: string[] } {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch (error) {
    return { errores: [`JSON mal escrito: ${(error as Error).message}`] };
  }
  const errores = validarCatalogo(datos);
  return errores.length > 0 ? { errores } : { productos: datos as Producto[] };
}
