// Fusiona lo leído de las carpetas con el catálogo existente (RF-4, RF-5, RF-6, RF-13).
import { ordenarPorPrecioDesc } from '../../src/app/datos/catalogo.ts';
import type { Producto } from '../../src/app/datos/producto.ts';
import { analizarCarpeta } from './carpetas.ts';

/** Un producto tal como sale de las carpetas, antes de fusionarlo. */
export interface ProductoEscaneado {
  id: string;
  origen: string;
  carpeta: string;
  /** Parte de la carpeta tras el precio, para detectar cambios de precio. */
  nombreCarpeta: string;
  nombreVisible: string;
  precio: number;
  fotografia_principal: string;
  fotografias: string[];
}

export interface CambioPrecio {
  anterior: string;
  nuevo: string;
  precioAnterior: number;
  precioNuevo: number;
}

export interface ResultadoFusion {
  /** Ordenado del más caro al más barato. */
  catalogo: Producto[];
  nuevos: string[];
  quitados: string[];
  preciosCambiados: CambioPrecio[];
}

export function fusionarCatalogo(
  existente: readonly Producto[],
  escaneados: readonly ProductoEscaneado[],
): ResultadoFusion {
  const existentePorId = new Map(existente.map((p) => [p.id, p]));
  const idsEscaneados = new Set(escaneados.map((e) => e.id));

  const nuevos = escaneados.filter((e) => !existentePorId.has(e.id));
  const quitados = existente.filter((p) => !idsEscaneados.has(p.id));

  // Cambio de precio: exactamente un quitado y un nuevo con el mismo origen y nombre de carpeta.
  const herencia = new Map<string, Producto>();
  const preciosCambiados: CambioPrecio[] = [];
  const grupo = (origen: string, nombreCarpeta: string) => `${origen}/${nombreCarpeta}`;
  const nombreDeCarpeta = (p: Producto) => analizarCarpeta(p.carpeta)?.nombre ?? p.carpeta;

  for (const nuevo of nuevos) {
    const clave = grupo(nuevo.origen, nuevo.nombreCarpeta);
    const nuevosDelGrupo = nuevos.filter((n) => grupo(n.origen, n.nombreCarpeta) === clave);
    const quitadosDelGrupo = quitados.filter((q) => grupo(q.origen, nombreDeCarpeta(q)) === clave);
    if (nuevosDelGrupo.length === 1 && quitadosDelGrupo.length === 1) {
      const anterior = quitadosDelGrupo[0];
      herencia.set(nuevo.id, anterior);
      preciosCambiados.push({
        anterior: anterior.id,
        nuevo: nuevo.id,
        precioAnterior: anterior.precio,
        precioNuevo: nuevo.precio,
      });
    }
  }

  const catalogo = escaneados.map((e): Producto => {
    const previo = existentePorId.get(e.id) ?? herencia.get(e.id);
    return {
      id: e.id,
      origen: e.origen,
      carpeta: e.carpeta,
      nombre: previo?.nombre ?? e.nombreVisible,
      precio: e.precio,
      descripcion: previo?.descripcion ?? '',
      fotografia_principal: e.fotografia_principal,
      fotografias: e.fotografias,
    };
  });

  const heredados = new Set(preciosCambiados.map((c) => c.anterior));
  return {
    catalogo: ordenarPorPrecioDesc(catalogo),
    nuevos: nuevos.filter((n) => !herencia.has(n.id)).map((n) => n.id),
    quitados: quitados.filter((q) => !heredados.has(q.id)).map((q) => q.id),
    preciosCambiados,
  };
}
