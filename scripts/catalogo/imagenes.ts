// Copias web de las fotos. Usa `sips` en macOS y System.Drawing en Windows.
// Tiene efectos: no lleva tests unitarios.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import type { MedidaCopia } from './resumen.ts';

const LADO_MAXIMO = 1200;
const BYTES_OBJETIVO = 300_000;
const CALIDADES = [80, 65, 50, 40, 30, 20, 10];

export interface Dimensiones {
  ancho: number;
  alto: number;
}

function ejecutarSips(argumentos: string[]): string {
  return execFileSync('sips', argumentos, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function literalPowerShell(valor: string): string {
  return `'${valor.replaceAll("'", "''")}'`;
}

function ejecutarPowerShell(script: string): string {
  return execFileSync(
    'powershell.exe',
    ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
}

/** Comprueba la herramienta de conversión antes de comenzar una generación. */
export function comprobarHerramientaImagenes(): void {
  if (process.platform === 'win32') {
    ejecutarPowerShell('exit 0');
  } else {
    ejecutarSips(['-h']);
  }
}

function leerDimensionesWindows(ruta: string): Dimensiones {
  const salida = ejecutarPowerShell(`
    Add-Type -AssemblyName System.Drawing
    $imagen = [System.Drawing.Image]::FromFile(${literalPowerShell(ruta)})
    Write-Output ("{0},{1}" -f $imagen.Width, $imagen.Height)
    $imagen.Dispose()
  `);
  const dimensiones = /^(\d+),(\d+)$/m.exec(salida.trim());
  const ancho = Number(dimensiones?.[1]);
  const alto = Number(dimensiones?.[2]);
  if (!ancho || !alto) throw new Error(`No es una imagen legible: ${ruta}`);
  return { ancho, alto };
}

/** Crea un JPEG redimensionado usando las herramientas incluidas en Windows. */
function crearCopiaWebWindows(origen: string, destino: string, calidad: number): void {
  ejecutarPowerShell(`
    Add-Type -AssemblyName System.Drawing
    $origen = ${literalPowerShell(origen)}
    $destino = ${literalPowerShell(destino)}
    $calidad = ${calidad}
    $imagen = [System.Drawing.Image]::FromFile($origen)
    $ladoMayor = [Math]::Max($imagen.Width, $imagen.Height)
    $escala = [Math]::Min(1.0, 1200 / [double]$ladoMayor)
    $ancho = [Math]::Max(1, [int][Math]::Round($imagen.Width * $escala))
    $alto = [Math]::Max(1, [int][Math]::Round($imagen.Height * $escala))
    $copia = New-Object System.Drawing.Bitmap -ArgumentList $ancho, $alto
    $grafico = [System.Drawing.Graphics]::FromImage($copia)
    $grafico.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $grafico.DrawImage($imagen, 0, 0, $ancho, $alto)
    $codificador = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
      Where-Object { $_.MimeType -eq 'image/jpeg' }
    $parametros = New-Object System.Drawing.Imaging.EncoderParameters -ArgumentList 1
    $parametros.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter -ArgumentList ([System.Drawing.Imaging.Encoder]::Quality), ([long]$calidad)
    $copia.Save($destino, $codificador, $parametros)
    $parametros.Dispose()
    $grafico.Dispose()
    $copia.Dispose()
    $imagen.Dispose()
  `);
}

/** Lanza un error si el archivo no es una imagen legible (sips devuelve `<nil>` sin fallar). */
export function leerDimensiones(ruta: string): Dimensiones {
  if (process.platform === 'win32') return leerDimensionesWindows(ruta);

  const salida = ejecutarSips(['-g', 'pixelWidth', '-g', 'pixelHeight', ruta]);
  const ancho = Number(/pixelWidth: (\d+)/.exec(salida)?.[1]);
  const alto = Number(/pixelHeight: (\d+)/.exec(salida)?.[1]);
  if (!ancho || !alto) throw new Error(`No es una imagen legible: ${ruta}`);
  return { ancho, alto };
}

/** JPEG con el lado mayor ≤ 1200 px, sin agrandar nunca las fotos pequeñas (RF-11). */
export function crearCopiaWeb(origen: string, destino: string): void {
  const { ancho, alto } = leerDimensiones(origen);
  mkdirSync(path.dirname(destino), { recursive: true });

  for (const calidad of CALIDADES) {
    if (process.platform === 'win32') {
      crearCopiaWebWindows(origen, destino, calidad);
    } else {
      const reducir = Math.max(ancho, alto) > LADO_MAXIMO ? ['-Z', String(LADO_MAXIMO)] : [];
      ejecutarSips([
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
    }
    if (!existsSync(destino)) throw new Error(`No se creó la copia web: ${destino}`);
    if (statSync(destino).size <= BYTES_OBJETIVO) return;
  }
}

export function medirCopia(ruta: string): MedidaCopia {
  return { bytes: statSync(ruta).size, ...leerDimensiones(ruta) };
}
