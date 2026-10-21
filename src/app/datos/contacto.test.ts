import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearEnlaceWhatsapp } from './contacto.ts';

test('crea el enlace de wa.me con el número y el mensaje (RF-34)', () => {
  assert.equal(crearEnlaceWhatsapp('59170000000', 'Hola'), 'https://wa.me/59170000000?text=Hola');
});

test('quita el +, los espacios y los guiones del número', () => {
  assert.equal(
    crearEnlaceWhatsapp('+591 700-00 000', 'Hola'),
    'https://wa.me/59170000000?text=Hola',
  );
});

test('codifica tildes, signos y espacios del mensaje', () => {
  assert.equal(
    crearEnlaceWhatsapp('59170000000', '¿Tienen el disfraz de Señora medieval?'),
    'https://wa.me/59170000000?text=%C2%BFTienen%20el%20disfraz%20de%20Se%C3%B1ora%20medieval%3F',
  );
});

test('sin mensaje no añade el parámetro text', () => {
  assert.equal(crearEnlaceWhatsapp('59170000000', ''), 'https://wa.me/59170000000');
});
