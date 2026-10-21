import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  analizarCarpeta,
  esFotoValida,
  nombreCopia,
  nombreVisible,
  ordenarFotos,
} from './carpetas.ts';

test('analiza una carpeta válida (RF-3)', () => {
  assert.deepEqual(analizarCarpeta('90_mario'), { precio: 90, nombre: 'mario' });
});

test('separa el precio por el primer guion bajo', () => {
  assert.deepEqual(analizarCarpeta('140_dark_doll'), { precio: 140, nombre: 'dark_doll' });
});

test('ignora los ceros a la izquierda del precio', () => {
  assert.deepEqual(analizarCarpeta('090_x'), { precio: 90, nombre: 'x' });
});

test('rechaza las carpetas que no cumplen el formato (RF-2)', () => {
  for (const nombre of [
    'cruela',
    'harry_potter',
    '0_x',
    '000_x',
    '15_',
    '15__',
    '15_-_',
    '_x',
    'x_15',
    '',
  ]) {
    assert.equal(analizarCarpeta(nombre), null, nombre);
  }
});

test('crea el nombre visible (RF-4)', () => {
  assert.equal(nombreVisible('dark_doll'), 'Dark doll');
  assert.equal(nombreVisible('senora-medieval'), 'Senora medieval');
  assert.equal(nombreVisible('DARK__doll'), 'Dark doll');
  assert.equal(nombreVisible('_harry-hermonie_'), 'Harry hermonie');
  assert.equal(nombreVisible('grinch'), 'Grinch');
});

test('reconoce las fotos válidas', () => {
  for (const archivo of [
    '1.jpeg',
    'a.jpg',
    'b.png',
    'C.JPEG',
    'Captura de pantalla 4.14.06 p. m..png',
  ]) {
    assert.equal(esFotoValida(archivo), true, archivo);
  }
});

test('descarta WhatsApp, ocultos y otras extensiones', () => {
  for (const archivo of [
    '90_WhatsApp Image 2026-10-17 at 21.34.57.jpeg',
    'foto-whatsapp.png',
    '.DS_Store',
    '.oculta.jpeg',
    'video.mp4',
    'notas.txt',
    'jpeg',
  ]) {
    assert.equal(esFotoValida(archivo), false, archivo);
  }
});

test('1.jpeg es la principal y va primero (RF-7)', () => {
  assert.deepEqual(ordenarFotos(['b.jpeg', '1.jpeg', 'a.png']), {
    principal: '1.jpeg',
    fotos: ['1.jpeg', 'a.png', 'b.jpeg'],
    tiene1jpeg: true,
  });
});

test('sin 1.jpeg la principal es la primera en orden alfabético (RF-8)', () => {
  assert.deepEqual(
    ordenarFotos(['Gemini_b.jpeg', 'captura.png', '90_WhatsApp x.jpeg', '.DS_Store']),
    {
      principal: 'captura.png',
      fotos: ['captura.png', 'Gemini_b.jpeg'],
      tiene1jpeg: false,
    },
  );
});

test('1.JPEG y 1.jpg no cuentan como 1.jpeg', () => {
  const resultado = ordenarFotos(['1.JPEG', 'z.jpeg']);
  assert.equal(resultado?.tiene1jpeg, false);
  assert.equal(resultado?.principal, '1.JPEG');
});

test('ordena los números en orden natural', () => {
  assert.deepEqual(ordenarFotos(['10.jpeg', '2.jpeg', '1.jpeg'])?.fotos, [
    '1.jpeg',
    '2.jpeg',
    '10.jpeg',
  ]);
});

test('sin fotos válidas devuelve null (RF-10)', () => {
  assert.equal(ordenarFotos(['90_WhatsApp a.jpeg', '.DS_Store']), null);
  assert.equal(ordenarFotos([]), null);
});

test('crea nombres de copia seguros para URL', () => {
  assert.equal(nombreCopia('1.jpeg'), '1-jpeg.jpg');
  assert.equal(
    nombreCopia('Gemini_Generated_Image_87hg.jpeg'),
    'gemini-generated-image-87hg-jpeg.jpg',
  );
  assert.equal(
    nombreCopia('Captura de pantalla 2026-10-18 a la(s) 4.14.06 p. m..png'),
    'captura-de-pantalla-2026-10-18-a-la-s-4-14-06-p-m-png.jpg',
  );
  assert.equal(nombreCopia('Ángel Ñandú.PNG'), 'angel-nandu-png.jpg');
});

test('los nombres de copia no chocan entre extensiones', () => {
  assert.notEqual(nombreCopia('a.png'), nombreCopia('a.jpeg'));
});
