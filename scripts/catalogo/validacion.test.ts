import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerCatalogo, validarCatalogo } from './validacion.ts';

const valido = {
  id: 'segunda_salida/90_mario',
  origen: 'segunda_salida',
  carpeta: '90_mario',
  nombre: 'Mario',
  precio: 90,
  descripcion: '',
  fotografia_principal: 'fotos/a.jpg',
  fotografias: ['fotos/a.jpg'],
};

test('un catálogo válido no tiene errores', () => {
  assert.deepEqual(validarCatalogo([valido]), []);
  assert.deepEqual(validarCatalogo([]), []);
});

test('la raíz debe ser una lista', () => {
  assert.deepEqual(validarCatalogo({}), ['raíz: no es una lista']);
});

test('indica la posición y el campo erróneo (RF-15)', () => {
  const errores = validarCatalogo([valido, { ...valido, id: 'otro', descripcion: 5 }]);
  assert.deepEqual(errores, ['[1].descripcion: no es texto']);
});

test('detecta campos que faltan', () => {
  const { nombre: _quitado, ...sinNombre } = valido;
  assert.deepEqual(validarCatalogo([sinNombre]), ['[0].nombre: no es texto']);
});

test('el precio debe ser un entero mayor que 0', () => {
  for (const precio of [0, -5, 9.5, '90']) {
    assert.deepEqual(validarCatalogo([{ ...valido, precio }]), [
      '[0].precio: no es un entero mayor que 0',
    ]);
  }
});

test('las fotografías deben ser una lista de textos', () => {
  assert.deepEqual(validarCatalogo([{ ...valido, fotografias: ['a', 3] }]), [
    '[0].fotografias: no es una lista de textos',
  ]);
});

test('un elemento que no es un objeto', () => {
  assert.deepEqual(validarCatalogo(['hola']), ['[0]: no es un objeto']);
});

test('detecta ids repetidos', () => {
  assert.deepEqual(validarCatalogo([valido, valido]), ['[1].id: repetido']);
});

test('leerCatalogo devuelve los productos de un JSON válido', () => {
  assert.deepEqual(leerCatalogo(JSON.stringify([valido])), { productos: [valido] });
});

test('leerCatalogo informa de un JSON mal escrito', () => {
  const resultado = leerCatalogo('[{"nombre": "Mario",}]');
  assert.ok('errores' in resultado);
  assert.match(resultado.errores[0], /^JSON mal escrito: /);
});
