import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LONGITUD_MAXIMA_BUSQUEDA,
  buscar,
  coincide,
  mensajeSinResultados,
  normalizarTexto,
  palabrasDeBusqueda,
  textoBuscable,
  textoContador,
} from './busqueda.ts';
import { ordenarPorPrecioDesc } from './catalogo.ts';
import type { Producto } from './producto.ts';

function producto(nombre: string, precio: number, descripcion = ''): Producto {
  return {
    id: `segunda_salida/${precio}_${nombre}`,
    origen: 'segunda_salida',
    carpeta: `${precio}_${nombre}`,
    nombre,
    precio,
    descripcion,
    fotografia_principal: 'fotos/x.jpg',
    fotografias: ['fotos/x.jpg'],
  };
}

test('la búsqueda admite como máximo 50 caracteres (RF-3)', () => {
  assert.equal(LONGITUD_MAXIMA_BUSQUEDA, 50);
});

test('normaliza mayúsculas, tildes, ñ y ç', () => {
  assert.equal(normalizarTexto('GRÍNCH'), 'grinch');
  assert.equal(normalizarTexto('Niño'), 'nino');
  assert.equal(normalizarTexto('Ñandú'), 'nandu');
  assert.equal(normalizarTexto('Façade'), 'facade');
  assert.equal(normalizarTexto('Pingüino'), 'pinguino');
});

test('cambia por espacios los signos, los saltos de línea y los emojis', () => {
  assert.equal(normalizarTexto('spider-man'), 'spider man');
  assert.equal(normalizarTexto('Talla S\nniña'), 'talla s nina');
  assert.equal(normalizarTexto('🎃bruja!'), 'bruja');
});

test('reduce los espacios repetidos y quita los de los extremos', () => {
  assert.equal(normalizarTexto('  a   b  '), 'a b');
});

test('conserva los dígitos', () => {
  assert.equal(normalizarTexto('Harry poter 2'), 'harry poter 2');
});

test('parte el texto en palabras normalizadas', () => {
  assert.deepEqual(palabrasDeBusqueda('Dino  Peque'), ['dino', 'peque']);
});

test('vacío, solo espacios, solo signos o solo emojis es una búsqueda vacía (RF-9)', () => {
  for (const texto of ['', '   ', '-', '".', '🎃']) {
    assert.deepEqual(palabrasDeBusqueda(texto), [], JSON.stringify(texto));
  }
});

test('el texto buscable une el nombre y la descripción normalizados con un espacio', () => {
  assert.equal(textoBuscable(producto('Bruja', 50, 'Talla S,\nniña')), 'bruja talla s nina');
});

test('con la descripción vacía, el texto buscable es el nombre', () => {
  assert.equal(textoBuscable(producto('Dino peque', 280)).trim(), 'dino peque');
});

test('coincide si están todas las palabras, en cualquier orden (RF-8)', () => {
  const texto = textoBuscable(producto('Dino peque', 280));
  assert.equal(coincide(texto, palabrasDeBusqueda('dino peque')), true);
  assert.equal(coincide(texto, palabrasDeBusqueda('peque dino')), true);
});

test('basta con un fragmento de la palabra', () => {
  assert.equal(coincide(textoBuscable(producto('Bruja', 50)), ['bru']), true);
});

test('no coincide si falta alguna palabra', () => {
  assert.equal(coincide(textoBuscable(producto('Bruja', 50)), ['bruja', 'nina']), false);
});

test('coincide con una palabra en el nombre y otra en la descripción', () => {
  const texto = textoBuscable(producto('Bruja', 50, 'Para niña'));
  assert.equal(coincide(texto, palabrasDeBusqueda('bruja niña')), true);
});

test('una palabra no coincide a caballo entre el nombre y la descripción', () => {
  assert.equal(coincide(textoBuscable(producto('xa', 10, 'by')), ['ab']), false);
});

const nombres = (productos: Producto[]) => productos.map((p) => `${p.nombre} ${p.precio}`);

const catalogo = ordenarPorPrecioDesc([
  producto('Bruja', 50, 'Con escoba'),
  producto('Dinosaurios', 380),
  producto('Calaca', 50),
  producto('Bruja elegante', 120),
  producto('Calaca', 95),
  producto('Spider man', 150),
]);

test('la búsqueda vacía devuelve todos los productos, sin contador ni mensaje (RF-9)', () => {
  for (const texto of ['', '   ', '-🎃']) {
    const resultado = buscar(catalogo, texto);
    assert.deepEqual(resultado.productos, catalogo);
    assert.equal(resultado.contador, null);
    assert.equal(resultado.sinResultados, null);
  }
});

test('conserva el orden por precio del catálogo (RF-10)', () => {
  assert.deepEqual(nombres(buscar(catalogo, 'bruja').productos), [
    'Bruja elegante 120',
    'Bruja 50',
  ]);
});

test('muestra los productos con el mismo nombre y distinto precio (RF-11)', () => {
  assert.deepEqual(nombres(buscar(catalogo, 'CALACA').productos), ['Calaca 95', 'Calaca 50']);
});

test('busca también en la descripción', () => {
  assert.deepEqual(nombres(buscar(catalogo, 'escoba').productos), ['Bruja 50']);
});

test('spider-man encuentra "Spider man", pero spiderman no', () => {
  assert.deepEqual(nombres(buscar(catalogo, 'spider-man').productos), ['Spider man 150']);
  assert.deepEqual(buscar(catalogo, 'spiderman').productos, []);
});

test('no busca en el precio', () => {
  assert.deepEqual(buscar(catalogo, '380').productos, []);
});

test('con resultados da el contador y ningún mensaje (RF-14)', () => {
  const resultado = buscar(catalogo, 'bruja');
  assert.equal(resultado.contador, '2 productos');
  assert.equal(resultado.sinResultados, null);
});

test('sin resultados da el mensaje con el texto original recortado (RF-15)', () => {
  const resultado = buscar(catalogo, '  <q>Ñzz  ');
  assert.deepEqual(resultado.productos, []);
  assert.equal(resultado.contador, null);
  assert.equal(
    resultado.sinResultados,
    'No encontramos "<q>Ñzz". Escríbenos por WhatsApp y te ayudamos.',
  );
});

test('el contador distingue singular y plural (RF-14)', () => {
  assert.equal(textoContador(1), '1 producto');
  assert.equal(textoContador(12), '12 productos');
});

test('el mensaje sin resultados recorta los espacios de los extremos (RF-15)', () => {
  assert.equal(
    mensajeSinResultados('  zzz '),
    'No encontramos "zzz". Escríbenos por WhatsApp y te ayudamos.',
  );
});

test('buscar no modifica la lista recibida', () => {
  const copia = [...catalogo];
  buscar(catalogo, 'bruja');
  buscar(catalogo, '');
  assert.deepEqual(catalogo, copia);
});

test('la búsqueda vacía devuelve una copia, no la misma lista', () => {
  assert.notEqual(buscar(catalogo, '').productos, catalogo);
});

const ids = (resultado: { posiciones: ReadonlyMap<string, number> }) => [
  ...resultado.posiciones.entries(),
];

test('con búsqueda vacía, cada producto tiene su posición en el catálogo (RF-9)', () => {
  assert.deepEqual(
    ids(buscar(catalogo, '')),
    catalogo.map((p, i) => [p.id, i]),
  );
});

test('con resultados, solo están los resultados, numerados desde 0 (RF-8, RF-20)', () => {
  assert.deepEqual(ids(buscar(catalogo, 'calaca')), [
    ['segunda_salida/95_Calaca', 0],
    ['segunda_salida/50_Calaca', 1],
  ]);
});

test('sin resultados no hay posiciones (RF-15)', () => {
  assert.equal(buscar(catalogo, 'zz').posiciones.size, 0);
});
