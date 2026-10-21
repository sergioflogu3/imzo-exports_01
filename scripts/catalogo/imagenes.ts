// Copias web de las fotos con `sips` (incluido en macOS). Tiene efectos: no lleva tests unitarios.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import type { MedidaCopia } from './resumen.ts';

const LADO_MAXIMO = 1200;
const BYTES_OBJETIVO = 300_000;
const CALIDADES = [80, 65, 50, 40];

export interface Dimensiones {
  ancho: number;
  alto: number;
}

function sips(argumentos: string[]): string {
  return execFileSync('sips', argumentos, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/** Lanza un error si el archivo no es una imagen legible (sips devuelve `<nil>` sin fallar). */
export function leerDimensiones(ruta: string): Dimensiones {
  const salida = sips(['-g', 'pixelWidth', '-g', 'pixelHeight', ruta]);
  const ancho = Number(/pixelWidth: (\d+)/.exec(salida)?.[1]);
  const alto = Number(/pixelHeight: (\d+)/.exec(salida)?.[1]);
  if (!ancho || !alto) throw new Error(`No es una imagen legible: ${ruta}`);
  return { ancho, alto };
}

/** JPEG con el lado mayor ≤ 1200 px, sin agrandar nunca las fotos pequeñas (RF-11). */
export function crearCopiaWeb(origen: string, destino: string): void {
  const { ancho, alto } = leerDimensiones(origen);
  const reducir = Math.max(ancho, alto) > LADO_MAXIMO ? ['-Z', String(LADO_MAXIMO)] : [];
  mkdirSync(path.dirname(destino), { recursive: true });

  for (const calidad of CALIDADES) {
    sips([
      '-s',
      'format',
      'jpeg',
      '-s',
      'formatOptions',
      String(calidad),
      ...reducir,
      origen,
      '--out',
      destino,
    ]);
    if (!existsSync(destino)) throw new Error(`sips no creó la copia: ${destino}`);
    if (statSync(destino).size <= BYTES_OBJETIVO) return;
  }
}

export function medirCopia(ruta: string): MedidaCopia {
  return { bytes: statSync(ruta).size, ...leerDimensiones(ruta) };
}
