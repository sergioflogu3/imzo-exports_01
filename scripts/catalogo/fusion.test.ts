import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fusionarCatalogo, type ProductoEscaneado } from './fusion.ts';
import type { Producto } from '../../src/app/datos/producto.ts';

function escaneado(origen: string, carpeta: string, precio: number): ProductoEscaneado {
  const foto = `fotos/${origen}/${carpeta}/1-jpeg.jpg`;
  return {
    id: `${origen}/${carpeta}`,
    origen,
    carpeta,
    nombreCarpeta: carpeta.slice(carpeta.indexOf('_') + 1),
    nombreVisible: 'Visible ' + carpeta,
    precio,
    fotografia_principal: foto,
    fotografias: [foto],
  };
}

function existente(
  origen: string,
  carpeta: string,
  precio: number,
  nombre: string,
  descripcion: string,
): Producto {
  return {
    id: `${origen}/${carpeta}`,
    origen,
    carpeta,
    nombre,
    precio,
    descripcion,
    fotografia_principal: 'fotos/vieja.jpg',
    fotografias: ['fotos/vieja.jpg'],
  };
}

const S = 'segunda_salida';
const P = 'primera_salida';

test('un producto nuevo recibe el nombre visible y la descripción vacía (RF-4)', () => {
  const r = fusionarCatalogo([], [escaneado(S, '90_mario', 90)]);
  assert.equal(r.catalogo[0].nombre, 'Visible 90_mario');
  assert.equal(r.catalogo[0].descripcion, '');
  assert.deepEqual(r.nuevos, [`${S}/90_mario`]);
});

test('un producto existente conserva nombre y descripción y actualiza fotos (RF-5)', () => {
  const r = fusionarCatalogo(
    [existente(S, '90_mario', 90, 'Mario Bros', 'Talla M')],
    [escaneado(S, '90_mario', 90)],
  );
  assert.equal(r.catalogo[0].nombre, 'Mario Bros');
  assert.equal(r.catalogo[0].descripcion, 'Talla M');
  assert.deepEqual(r.catalogo[0].fotografias, [`fotos/${S}/90_mario/1-jpeg.jpg`]);
  assert.deepEqual(r.nuevos, []);
  assert.deepEqual(r.quitados, []);
});

test('el precio y las fotos editados a mano se sobrescriben', () => {
  const editado = { ...existente(S, '90_mario', 90, 'Mario', ''), precio: 1 };
  const r = fusionarCatalogo([editado], [escaneado(S, '90_mario', 90)]);
  assert.equal(r.catalogo[0].precio, 90);
});

test('un producto cuya carpeta desaparece se quita (RF-13)', () => {
  const r = fusionarCatalogo([existente(S, '90_mario', 90, 'Mario', '')], []);
  assert.deepEqual(r.catalogo, []);
  assert.deepEqual(r.quitados, [`${S}/90_mario`]);
});

test('un cambio de precio conserva nombre y descripción (RF-6)', () => {
  const r = fusionarCatalogo(
    [existente(S, '50_bruja', 50, 'Bruja clásica', 'Con sombrero')],
    [escaneado(S, '55_bruja', 55)],
  );
  assert.equal(r.catalogo.length, 1);
  assert.equal(r.catalogo[0].id, `${S}/55_bruja`);
  assert.equal(r.catalogo[0].precio, 55);
  assert.equal(r.catalogo[0].nombre, 'Bruja clásica');
  assert.equal(r.catalogo[0].descripcion, 'Con sombrero');
  assert.deepEqual(r.preciosCambiados, [
    { anterior: `${S}/50_bruja`, nuevo: `${S}/55_bruja`, precioAnterior: 50, precioNuevo: 55 },
  ]);
  assert.deepEqual(r.nuevos, []);
  assert.deepEqual(r.quitados, []);
});

test('si aparecen dos nuevos con el mismo nombre no es un cambio de precio', () => {
  const r = fusionarCatalogo(
    [existente(S, '50_x', 50, 'X editado', 'desc')],
    [escaneado(S, '55_x', 55), escaneado(S, '60_x', 60)],
  );
  assert.deepEqual(r.preciosCambiados, []);
  assert.deepEqual(r.quitados, [`${S}/50_x`]);
  assert.deepEqual(r.nuevos.sort(), [`${S}/55_x`, `${S}/60_x`]);
  assert.ok(r.catalogo.every((p) => p.descripcion === ''));
});

test('un cambio de precio en otra carpeta de origen no cuenta', () => {
  const r = fusionarCatalogo(
    [existente(P, '50_bruja', 50, 'Bruja', 'desc')],
    [escaneado(S, '55_bruja', 55)],
  );
  assert.deepEqual(r.preciosCambiados, []);
  assert.deepEqual(r.quitados, [`${P}/50_bruja`]);
  assert.equal(r.catalogo[0].descripcion, '');
});

test('calaca 50 y 95 son dos productos distintos', () => {
  const r = fusionarCatalogo(
    [existente(S, '50_calaca', 50, 'Calaca', 'a'), existente(S, '95_calaca', 95, 'Calaca', 'b')],
    [escaneado(S, '50_calaca', 50), escaneado(S, '95_calaca', 95)],
  );
  assert.equal(r.catalogo.length, 2);
  assert.deepEqual(
    r.catalogo.map((p) => p.descripcion),
    ['b', 'a'],
  );
  assert.deepEqual(r.preciosCambiados, []);
});

test('la misma carpeta en los dos orígenes da dos productos', () => {
  const r = fusionarCatalogo([], [escaneado(P, '40_rey', 40), escaneado(S, '40_rey', 40)]);
  assert.equal(r.catalogo.length, 2);
  assert.notEqual(r.catalogo[0].id, r.catalogo[1].id);
});

test('el catálogo sale ordenado del más caro al más barato', () => {
  const r = fusionarCatalogo([], [escaneado(S, '20_abeja', 20), escaneado(S, '350_grinch', 350)]);
  assert.deepEqual(
    r.catalogo.map((p) => p.precio),
    [350, 20],
  );
});
