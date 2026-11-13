// Funciones puras para interpretar las carpetas de producto y sus fotos.
import { compararTexto } from '../../src/app/datos/catalogo.ts';

export interface CarpetaAnalizada {
  precio: number;
  /** Parte de la carpeta tras el primer "_", sin tocar. */
  nombre: string;
}

export interface FotosOrdenadas {
  principal: string;
  /** Todas las fotos válidas, con la principal primero. */
  fotos: string[];
  tiene1jpeg: boolean;
}

const FOTO_PRINCIPAL = '1.jpeg';

/** `{precio}_{nombre}` con precio > 0 y nombre con alguna letra o número; si no, null (RF-2, RF-3). */
export function analizarCarpeta(carpeta: string): CarpetaAnalizada | null {
  const coincidencia = /^(\d+)_(.+)$/.exec(carpeta);
  if (!coincidencia) return null;
  const precio = Number(coincidencia[1]);
  const nombre = coincidencia[2];
  if (precio <= 0 || !/[\p{L}\p{N}]/u.test(nombre)) return null;
  return { precio, nombre };
}

/** `dark_doll` → `Dark doll` (RF-4). */
export function nombreVisible(nombre: string): string {
  const texto = nombre.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function esFotoValida(archivo: string): boolean {
  return !archivo.startsWith('.') && /.\.(jpe?g|png)$/i.test(archivo) && !/whatsapp/i.test(archivo);
}

/** Filtra las fotos válidas y elige la principal; null si no queda ninguna (RF-7, RF-8, RF-10). */
export function ordenarFotos(archivos: readonly string[]): FotosOrdenadas | null {
  const validas = archivos.filter(esFotoValida).sort(compararTexto);
  if (validas.length === 0) return null;
  const tiene1jpeg = validas.includes(FOTO_PRINCIPAL);
  const principal = tiene1jpeg ? FOTO_PRINCIPAL : validas[0];
  return {
    principal,
    fotos: [principal, ...validas.filter((foto) => foto !== principal)],
    tiene1jpeg,
  };
}

/** Nombre de la copia web: solo `a-z0-9-` y `.jpg` al final, para que la URL no necesite codificarse. */
export function nombreCopia(archivo: string): string {
  const base = archivo
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}.jpg`;
}

/** Carpetas de origen que no existen, en el orden recibido (RF-14; spec 003, RF-1). */
export function origenesQueFaltan(
  origenes: readonly string[],
  esCarpeta: (origen: string) => boolean,
): string[] {
  return origenes.filter((origen) => !esCarpeta(origen));
}

/**
 * true si hay que (re)crear la copia web: no existe o su fecha no coincide, en segundos, con la
 * del original. La copia guarda la fecha de su original, así que también detecta una foto
 * reemplazada por otra más antigua (RF-11).
 */
export function copiaDesactualizada(mtimeOriginalMs: number, mtimeCopiaMs: number | null): boolean {
  if (mtimeCopiaMs === null) return true;
  return Math.floor(mtimeOriginalMs / 1000) !== Math.floor(mtimeCopiaMs / 1000);
}
