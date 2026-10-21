import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearResumen, esCopiaPesada, type DatosResumen } from './resumen.ts';

test('una copia dentro de los límites no es pesada (RNF-3)', () => {
  assert.equal(esCopiaPesada({ bytes: 300_000, ancho: 675, alto: 1200 }), false);
  assert.equal(esCopiaPesada({ bytes: 76_680, ancho: 1200, alto: 1200 }), false);
});

test('pasa de 300 KB: pesada', () => {
  assert.equal(esCopiaPesada({ bytes: 300_001, ancho: 675, alto: 1200 }), true);
});

test('el lado mayor pasa de 1200 px: pesada', () => {
  assert.equal(esCopiaPesada({ bytes: 1000, ancho: 675, alto: 1201 }), true);
  assert.equal(esCopiaPesada({ bytes: 1000, ancho: 1201, alto: 675 }), true);
});

const vacio: DatosResumen = {
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

test('el resumen incluye el total, las copias y las 6 categorías (RF-16)', () => {
  const texto = crearResumen({
    ...vacio,
    productos: 75,
    copiasCreadas: 186,
    copiasBorradas: 2,
    noDisponibles: ['primera_salida/cruela'],
    sin1jpeg: ['segunda_salida/90_mario'],
    sinFotos: ['segunda_salida/20_vacia'],
    fotosConError: ['segunda_salida/50_bruja/rota.jpeg'],
    preciosCambiados: [
      {
        anterior: 'segunda_salida/50_bruja',
        nuevo: 'segunda_salida/55_bruja',
        precioAnterior: 50,
        precioNuevo: 55,
      },
    ],
    pesadas: ['fotos/segunda_salida/350_grinch/a.jpg'],
  });
  assert.match(texto, /Catálogo generado: 75 productos\./);
  assert.match(texto, /Copias web: 186 creadas, 2 borradas\./);
  assert.match(texto, /No disponible \(1\):\n {2}- primera_salida\/cruela/);
  assert.match(texto, /Sin 1\.jpeg \(1\):\n {2}- segunda_salida\/90_mario/);
  assert.match(texto, /Sin fotos \(1\):\n {2}- segunda_salida\/20_vacia/);
  assert.match(texto, /Foto con error \(1\):\n {2}- segunda_salida\/50_bruja\/rota\.jpeg/);
  assert.match(
    texto,
    /Precio cambiado \(1\):\n {2}- segunda_salida\/50_bruja → 55_bruja \(Bs\. 50 → Bs\. 55\)/,
  );
  assert.match(texto, /Pesada \(1\):\n {2}- fotos\/segunda_salida\/350_grinch\/a\.jpg/);
});

test('las categorías vacías se muestran con 0', () => {
  const texto = crearResumen({ ...vacio, productos: 1 });
  for (const titulo of [
    'No disponible',
    'Sin 1.jpeg',
    'Sin fotos',
    'Foto con error',
    'Precio cambiado',
    'Pesada',
  ]) {
    assert.ok(texto.includes(`${titulo} (0)`), titulo);
  }
});

test('usa el singular con un solo producto', () => {
  assert.match(crearResumen({ ...vacio, productos: 1 }), /Catálogo generado: 1 producto\./);
});
