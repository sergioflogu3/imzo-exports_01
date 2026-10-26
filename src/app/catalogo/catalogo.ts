import { Component, computed, signal, viewChild } from '@angular/core';
import { Buscador } from '../buscador/buscador';
import { buscar } from '../datos/busqueda';
import { ordenarPorPrecioDesc } from '../datos/catalogo';
import { MENSAJE_WHATSAPP, NUMERO_WHATSAPP, crearEnlaceWhatsapp } from '../datos/contacto';
import type { Producto } from '../datos/producto';
import datos from '../datos/productos.json';
import { DetalleProducto } from '../detalle-producto/detalle-producto';
import { TarjetaProducto } from '../tarjeta-producto/tarjeta-producto';

@Component({
  selector: 'app-catalogo',
  imports: [Buscador, TarjetaProducto, DetalleProducto],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  // El orden se calcula fuera del componente (principio 3).
  protected readonly productos = ordenarPorPrecioDesc(datos as Producto[]);
  /** Solo en memoria: al recargar la página vuelve vacío (RF-23). */
  protected readonly texto = signal('');
  // El filtro también se calcula fuera del componente (principio 3).
  protected readonly resultado = computed(() => buscar(this.productos, this.texto()));
  /** El mismo enlace que el botón fijo de WhatsApp (RF-16). */
  protected readonly enlaceWhatsapp = crearEnlaceWhatsapp(NUMERO_WHATSAPP, MENSAJE_WHATSAPP);
  private readonly buscador = viewChild(Buscador);
  protected readonly abierto = signal<Producto | null>(null);

  /** Vacía la búsqueda y devuelve el foco al campo, como "Borrar búsqueda" (RF-16). */
  protected verTodos(): void {
    this.buscador()?.borrar();
  }

  protected cerrar(): void {
    const id = this.abierto()?.id;
    this.abierto.set(null);
    // Devuelve el foco a la tarjeta del producto (RF-26).
    document.querySelector<HTMLElement>(`[data-producto="${id}"]`)?.focus();
  }
}
