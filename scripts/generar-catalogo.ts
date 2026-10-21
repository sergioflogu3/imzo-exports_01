// Genera src/app/datos/productos.json y public/fotos/ a partir de ../primera_salida y ../segunda_salida.
// Uso: npm run catalogo
import {
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import type { Producto } from '../src/app/datos/producto.ts';
import { analizarCarpeta, nombreCopia, nombreVisible, ordenarFotos } from './catalogo/carpetas.ts';
import { fusionarCatalogo, type ProductoEscaneado } from './catalogo/fusion.ts';
import { crearCopiaWeb, medirCopia } from './catalogo/imagenes.ts';
import { crearResumen, esCopiaPesada, type DatosResumen } from './catalogo/resumen.ts';
import { leerCatalogo } from './catalogo/validacion.ts';

const RAIZ_PROYECTO = path.resolve(import.meta.dirname, '..');
const RAIZ_ORIGENES = path.resolve(RAIZ_PROYECTO, '..');
const ORIGENES = ['primera_salida', 'segunda_salida'];
const RUTA_CATALOGO = path.join(RAIZ_PROYECTO, 'src/app/datos/productos.json');
const CARPETA_PUBLICA = path.join(RAIZ_PROYECTO, 'public');
const CARPETA_FOTOS = path.join(CARPETA_PUBLICA, 'fotos');

function esCarpeta(ruta: string): boolean {
  return existsSync(ruta) && statSync(ruta).isDirectory();
}

function fallar(mensaje: string): never {
  console.error(`Error: ${mensaje}\nNo se ha modificado nada.`);
  process.exit(1);
}

/** RF-14 y RF-15: se comprueba todo antes de escribir nada. */
function leerCatalogoExistente(): Producto[] {
  for (const origen of ORIGENES) {
    const ruta = path.join(RAIZ_ORIGENES, origen);
    if (!esCarpeta(ruta)) fallar(`no se encuentra la carpeta de origen ${ruta}`);
  }
  if (!existsSync(RUTA_CATALOGO)) return [];
  const resultado = leerCatalogo(readFileSync(RUTA_CATALOGO, 'utf8'));
  if ('errores' in resultado) {
    fallar(`productos.json tiene errores de formato:\n  - ${resultado.errores.join('\n  - ')}`);
  }
  return resultado.productos;
}

function necesitaCopia(original: string, copia: string): boolean {
  return !existsSync(copia) || statSync(original).mtimeMs > statSync(copia).mtimeMs;
}

function escanearOrigenes(resumen: DatosResumen): ProductoEscaneado[] {
  const escaneados: ProductoEscaneado[] = [];

  for (const origen of ORIGENES) {
    const carpetas = readdirSync(path.join(RAIZ_ORIGENES, origen), { withFileTypes: true })
      .filter((entrada) => entrada.isDirectory())
      .map((entrada) => entrada.name)
      .sort();

    for (const carpeta of carpetas) {
      const id = `${origen}/${carpeta}`;
      const analizada = analizarCarpeta(carpeta);
      if (!analizada) {
        resumen.noDisponibles.push(id);
        continue;
      }

      const rutaCarpeta = path.join(RAIZ_ORIGENES, origen, carpeta);
      const ordenadas = ordenarFotos(readdirSync(rutaCarpeta));
      const urls: string[] = [];
      let principalLegible = false;

      for (const foto of ordenadas?.fotos ?? []) {
        const original = path.join(rutaCarpeta, foto);
        const url = `fotos/${origen}/${carpeta}/${nombreCopia(foto)}`;
        const copia = path.join(CARPETA_PUBLICA, url);
        try {
          if (necesitaCopia(original, copia)) {
            crearCopiaWeb(original, copia);
            resumen.copiasCreadas++;
          }
          if (esCopiaPesada(medirCopia(copia))) resumen.pesadas.push(url);
        } catch {
          resumen.fotosConError.push(`${id}/${foto}`);
          continue;
        }
        if (foto === ordenadas?.principal) principalLegible = true;
        urls.push(url);
      }

      if (urls.length === 0) {
        resumen.sinFotos.push(id);
        continue;
      }
      if (!ordenadas?.tiene1jpeg || !principalLegible) resumen.sin1jpeg.push(id);

      escaneados.push({
        id,
        origen,
        carpeta,
        nombreCarpeta: analizada.nombre,
        nombreVisible: nombreVisible(analizada.nombre),
        precio: analizada.precio,
        fotografia_principal: urls[0],
        fotografias: urls,
      });
    }
  }
  return escaneados;
}

/** RF-12: borra las copias que no usa ningún producto, y las carpetas que queden vacías. */
function borrarCopiasSobrantes(catalogo: readonly Producto[]): number {
  if (!esCarpeta(CARPETA_FOTOS)) return 0;
  const enUso = new Set(catalogo.flatMap((p) => p.fotografias));
  let borradas = 0;

  const recorrer = (carpeta: string): void => {
    for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
      const ruta = path.join(carpeta, entrada.name);
      if (entrada.isDirectory()) {
        recorrer(ruta);
        if (readdirSync(ruta).length === 0) rmdirSync(ruta);
      } else if (!enUso.has(path.relative(CARPETA_PUBLICA, ruta).split(path.sep).join('/'))) {
        unlinkSync(ruta);
        borradas++;
      }
    }
  };
  recorrer(CARPETA_FOTOS);
  return borradas;
}

function escribirCatalogo(catalogo: readonly Producto[]): void {
  const temporal = `${RUTA_CATALOGO}.tmp`;
  writeFileSync(temporal, `${JSON.stringify(catalogo, null, 2)}\n`);
  renameSync(temporal, RUTA_CATALOGO);
}

function generar(): void {
  const existente = leerCatalogoExistente();
  const resumen: DatosResumen = {
    productos: 0,
    copiasCreadas: 0,
    copiasBorradas: 0,
    noDisponibles: [],
    sin1jpeg: [],
    sinFotos: [],
    fotosConError: [],
    preciosCambiados: [],
    pesadas: [],
  };

  const { catalogo, preciosCambiados } = fusionarCatalogo(existente, escanearOrigenes(resumen));
  escribirCatalogo(catalogo);
  resumen.copiasBorradas = borrarCopiasSobrantes(catalogo);
  resumen.productos = catalogo.length;
  resumen.preciosCambiados = preciosCambiados;
  console.log(crearResumen(resumen));
}

generar();
