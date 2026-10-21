import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compararTexto, formatearPrecio, ordenarPorPrecioDesc } from './catalogo.ts';
import type { Producto } from './producto.ts';

function producto(nombre: string, precio: number): Producto {
  return {
    id: `segunda_salida/${precio}_${nombre}`,
    origen: 'segunda_salida',
    carpeta: `${precio}_${nombre}`,
    nombre,
    precio,
    descripcion: '',
    fotografia_principal: 'fotos/x.jpg',
    fotografias: ['fotos/x.jpg'],
  };
}

const nombres = (productos: Producto[]) => productos.map((p) => p.nombre);

test('ordena del más caro al más barato (RF-17)', () => {
  const ordenados = ordenarPorPrecioDesc([
    producto('Abeja', 20),
    producto('Grinch', 350),
    producto('Mario', 90),
  ]);
  assert.deepEqual(nombres(ordenados), ['Grinch', 'Mario', 'Abeja']);
});

test('a igual precio ordena por nombre sin distinguir mayúsculas ni tildes (RF-17)', () => {
  const ordenados = ordenarPorPrecioDesc([
    producto('Zorro', 50),
    producto('Ángel', 50),
    producto('abeja', 50),
  ]);
  assert.deepEqual(nombres(ordenados), ['abeja', 'Ángel', 'Zorro']);
});

test('no modifica el array original', () => {
  const original = [producto('Abeja', 20), producto('Grinch', 350)];
  ordenarPorPrecioDesc(original);
  assert.deepEqual(nombres(original), ['Abeja', 'Grinch']);
});

test('una lista vacía devuelve una lista vacía', () => {
  assert.deepEqual(ordenarPorPrecioDesc([]), []);
});

test('formatea el precio en bolivianos (RF-18)', () => {
  assert.equal(formatearPrecio(90), 'Bs. 90');
  assert.equal(formatearPrecio(380), 'Bs. 380');
});

test('compararTexto ordena los números en orden natural', () => {
  assert.deepEqual(['10.jpeg', '2.jpeg', '1.jpeg'].sort(compararTexto), [
    '1.jpeg',
    '2.jpeg',
    '10.jpeg',
  ]);
});
