// Medición de las copias web y texto del resumen de la generación (RF-16, RNF-3).
import { formatearPrecio } from '../../src/app/datos/catalogo.ts';
import type { Seccion } from '../../src/app/datos/secciones.ts';
import type { CambioPrecio } from './fusion.ts';

/** 300 KB en unidades decimales, como las muestra el Finder de macOS. */
const BYTES_MAXIMOS = 300_000;
const LADO_MAXIMO = 1200;

export interface MedidaCopia {
  bytes: number;
  ancho: number;
  alto: number;
}

export function esCopiaPesada({ bytes, ancho, alto }: MedidaCopia): boolean {
  return bytes > BYTES_MAXIMOS || Math.max(ancho, alto) > LADO_MAXIMO;
}

export interface DatosResumen {
  productos: number;
  /** Productos de cada pestaña (spec 003, RF-3). */
  porSeccion: Record<Seccion, number>;
  copiasCreadas: number;
  copiasBorradas: number;
  noDisponibles: string[];
  sin1jpeg: string[];
  sinFotos: string[];
  fotosConError: string[];
  preciosCambiados: CambioPrecio[];
  pesadas: string[];
}

function seccion(titulo: string, elementos: readonly string[]): string {
  return [`${titulo} (${elementos.length}):`, ...elementos.map((e) => `  - ${e}`)].join('\n');
}

function describirCambio({ anterior, nuevo, precioAnterior, precioNuevo }: CambioPrecio): string {
  const carpetaNueva = nuevo.slice(nuevo.lastIndexOf('/') + 1);
  return `${anterior} → ${carpetaNueva} (${formatearPrecio(precioAnterior)} → ${formatearPrecio(precioNuevo)})`;
}

export function crearResumen(datos: DatosResumen): string {
  const productos = `${datos.productos} ${datos.productos === 1 ? 'producto' : 'productos'}`;
  return [
    `Catálogo generado: ${productos}.\nNavidad: ${datos.porSeccion.navidad} · Disfraces: ${datos.porSeccion.disfraces}`,
    `Copias web: ${datos.copiasCreadas} creadas, ${datos.copiasBorradas} borradas.`,
    seccion('No disponible', datos.noDisponibles),
    seccion('Sin 1.jpeg', datos.sin1jpeg),
    seccion('Sin fotos', datos.sinFotos),
    seccion('Foto con error', datos.fotosConError),
    seccion('Precio cambiado', datos.preciosCambiados.map(describirCambio)),
    seccion('Pesada', datos.pesadas),
  ].join('\n\n');
}
