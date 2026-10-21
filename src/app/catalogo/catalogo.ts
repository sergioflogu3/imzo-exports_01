import { Component, signal } from '@angular/core';
import { ordenarPorPrecioDesc } from '../datos/catalogo';
import type { Producto } from '../datos/producto';
import datos from '../datos/productos.json';
import { DetalleProducto } from '../detalle-producto/detalle-producto';
import { TarjetaProducto } from '../tarjeta-producto/tarjeta-producto';

@Component({
  selector: 'app-catalogo',
  imports: [TarjetaProducto, DetalleProducto],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  // El orden se calcula fuera del componente (principio 3).
  protected readonly productos = ordenarPorPrecioDesc(datos as Producto[]);
  protected readonly abierto = signal<Producto | null>(null);

  protected cerrar(): void {
    const id = this.abierto()?.id;
    this.abierto.set(null);
    // Devuelve el foco a la tarjeta del producto (RF-26).
    document.querySelector<HTMLElement>(`[data-producto="${id}"]`)?.focus();
  }
}
