import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Producto } from './producto.ts';
import { buscar } from './busqueda.ts';
import {
  ORIGENES,
  SECCIONES,
  contarPorSeccion,
  pestanaSiguiente,
  productosDeSeccion,
  seccionDeOrigen,
} from './secciones.ts';

function producto(origen: string, carpeta: string, precio: number): Producto {
  return {
    id: `${origen}/${carpeta}`,
    origen,
    carpeta,
    nombre: carpeta,
    precio,
    descripcion: '',
    fotografia_principal: 'fotos/x.jpg',
    fotografias: ['fotos/x.jpg'],
  };
}

const ids = (productos: Producto[]) => productos.map((p) => p.id);

test('primera_salida y segunda_salida son Disfraces y tercera_salida es Navidad (RF-2)', () => {
  assert.equal(seccionDeOrigen('primera_salida'), 'disfraces');
  assert.equal(seccionDeOrigen('segunda_salida'), 'disfraces');
  assert.equal(seccionDeOrigen('tercera_salida'), 'navidad');
});

test('un origen desconocido no tiene sección (RF-2)', () => {
  assert.equal(seccionDeOrigen('cuarta_salida'), null);
  assert.equal(seccionDeOrigen(''), null);
});

test('las carpetas de origen son exactamente las tres (RF-1)', () => {
  assert.deepEqual([...ORIGENES].sort(), ['primera_salida', 'segunda_salida', 'tercera_salida']);
});

test('las pestañas van en orden Navidad, Disfraces (RF-4)', () => {
  assert.deepEqual(SECCIONES, [
    { id: 'navidad', etiqueta: 'Navidad' },
    { id: 'disfraces', etiqueta: 'Disfraces' },
  ]);
});

test('productosDeSeccion conserva el orden recibido (RF-9)', () => {
  const ordenados = [
    producto('tercera_salida', '350_grinch', 350),
    producto('segunda_salida', '280_dino_peque', 280),
    producto('tercera_salida', '180_papanoel', 180),
    producto('primera_salida', '90_mario', 90),
    producto('tercera_salida', '8_sorpresas_navidenas', 8),
  ];
  assert.deepEqual(ids(productosDeSeccion(ordenados, 'navidad')), [
    'tercera_salida/350_grinch',
    'tercera_salida/180_papanoel',
    'tercera_salida/8_sorpresas_navidenas',
  ]);
  assert.deepEqual(ids(productosDeSeccion(ordenados, 'disfraces')), [
    'segunda_salida/280_dino_peque',
    'primera_salida/90_mario',
  ]);
});

test('la misma carpeta en dos orígenes sale una vez en cada sección (casos límite)', () => {
  const productos = [
    producto('segunda_salida', '350_grinch', 350),
    producto('tercera_salida', '350_grinch', 350),
  ];
  assert.deepEqual(ids(productosDeSeccion(productos, 'navidad')), ['tercera_salida/350_grinch']);
  assert.deepEqual(ids(productosDeSeccion(productos, 'disfraces')), ['segunda_salida/350_grinch']);
});

test('productos con el mismo nombre y distinto precio no se fusionan (casos límite)', () => {
  const productos = [
    producto('tercera_salida', '45_sorpresas_navidenas', 45),
    producto('tercera_salida', '40_sorpresas_navidenas', 40),
    producto('tercera_salida', '8_sorpresas_navidenas', 8),
  ];
  assert.equal(productosDeSeccion(productos, 'navidad').length, 3);
});

test('un producto de origen desconocido no sale en ninguna sección (RF-2)', () => {
  const productos = [producto('cuarta_salida', '10_x', 10)];
  assert.deepEqual(productosDeSeccion(productos, 'navidad'), []);
  assert.deepEqual(productosDeSeccion(productos, 'disfraces'), []);
});

test('productosDeSeccion no modifica la lista recibida', () => {
  const original = [
    producto('segunda_salida', '90_mario', 90),
    producto('tercera_salida', '350_grinch', 350),
  ];
  const copia = [...original];
  productosDeSeccion(original, 'navidad');
  assert.deepEqual(original, copia);
});

test('contarPorSeccion cuenta los productos de cada sección y suman el total (RF-3)', () => {
  const productos = [
    producto('tercera_salida', '350_grinch', 350),
    producto('tercera_salida', '8_sorpresas_navidenas', 8),
    producto('primera_salida', '90_mario', 90),
    producto('segunda_salida', '280_dino_peque', 280),
    producto('segunda_salida', '50_calaca', 50),
  ];
  const cuenta = contarPorSeccion(productos);
  assert.deepEqual(cuenta, { navidad: 2, disfraces: 3 });
  assert.equal(cuenta.navidad + cuenta.disfraces, productos.length);
});

test('contarPorSeccion ignora los orígenes desconocidos y da ceros sin productos (RF-3)', () => {
  assert.deepEqual(contarPorSeccion([producto('cuarta_salida', '10_x', 10)]), {
    navidad: 0,
    disfraces: 0,
  });
  assert.deepEqual(contarPorSeccion([]), { navidad: 0, disfraces: 0 });
});

test('las flechas llevan a la otra pestaña y vuelven desde los extremos (RF-8)', () => {
  assert.equal(pestanaSiguiente('navidad', 'ArrowRight'), 'disfraces');
  assert.equal(pestanaSiguiente('disfraces', 'ArrowRight'), 'navidad');
  assert.equal(pestanaSiguiente('disfraces', 'ArrowLeft'), 'navidad');
  assert.equal(pestanaSiguiente('navidad', 'ArrowLeft'), 'disfraces');
});

test('Inicio lleva a Navidad y Fin a Disfraces (RF-8)', () => {
  assert.equal(pestanaSiguiente('disfraces', 'Home'), 'navidad');
  assert.equal(pestanaSiguiente('navidad', 'Home'), 'navidad');
  assert.equal(pestanaSiguiente('navidad', 'End'), 'disfraces');
  assert.equal(pestanaSiguiente('disfraces', 'End'), 'disfraces');
});

test('las demás teclas no cambian de pestaña, Escape incluido (RF-8, RF-17)', () => {
  for (const tecla of ['Enter', ' ', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'a']) {
    assert.equal(pestanaSiguiente('navidad', tecla), null, tecla);
  }
});

// La combinación que usa Catalogo: buscar() sobre los productos de la sección.
function nombrados(origen: string, carpeta: string, precio: number, nombre: string): Producto {
  return { ...producto(origen, carpeta, precio), nombre };
}

const catalogo = [
  nombrados('tercera_salida', '350_grinch', 350, 'Grinch'),
  nombrados('segunda_salida', '350_grinch', 350, 'Grinch'),
  nombrados('segunda_salida', '280_dino_peque', 280, 'Dino peque'),
  nombrados('tercera_salida', '180_papanoel', 180, 'Papanoel'),
  nombrados('primera_salida', '90_mario', 90, 'Mario'),
];

test('con la búsqueda vacía se ven todos los productos de la sección (RF-14)', () => {
  const resultado = buscar(productosDeSeccion(catalogo, 'navidad'), '');
  assert.deepEqual(ids(resultado.productos), [
    'tercera_salida/350_grinch',
    'tercera_salida/180_papanoel',
  ]);
  assert.equal(resultado.contador, null);
  assert.equal(resultado.sinResultados, null);
});

test('la búsqueda solo encuentra los productos de la sección (RF-14)', () => {
  const navidad = buscar(productosDeSeccion(catalogo, 'navidad'), 'grinch');
  assert.deepEqual(ids(navidad.productos), ['tercera_salida/350_grinch']);
  assert.equal(navidad.contador, '1 producto');

  const disfraces = buscar(productosDeSeccion(catalogo, 'disfraces'), 'grinch');
  assert.deepEqual(ids(disfraces.productos), ['segunda_salida/350_grinch']);
  assert.equal(disfraces.contador, '1 producto');
});

test('un texto que solo está en la otra sección da el mensaje sin resultados (RF-14, RF-15)', () => {
  const resultado = buscar(productosDeSeccion(catalogo, 'navidad'), 'mario');
  assert.deepEqual(resultado.productos, []);
  assert.equal(resultado.contador, null);
  assert.equal(
    resultado.sinResultados,
    'No encontramos "mario". Escríbenos por WhatsApp y te ayudamos.',
  );
});

test('una sección sin productos da una lista vacía (RF-12)', () => {
  const soloDisfraces = catalogo.filter((p) => p.origen !== 'tercera_salida');
  assert.deepEqual(productosDeSeccion(soloDisfraces, 'navidad'), []);
});

test('las posiciones no incluyen productos de la otra sección (RF-11)', () => {
  const { posiciones } = buscar(productosDeSeccion(catalogo, 'navidad'), '');
  assert.deepEqual(
    [...posiciones.entries()],
    [
      ['tercera_salida/350_grinch', 0],
      ['tercera_salida/180_papanoel', 1],
    ],
  );
  assert.equal(posiciones.has('primera_salida/90_mario'), false);
  assert.equal(posiciones.has('segunda_salida/350_grinch'), false);
});
