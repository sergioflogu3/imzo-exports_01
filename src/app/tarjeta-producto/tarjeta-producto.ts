import { Component, input, output, signal } from '@angular/core';
import { formatearPrecio } from '../datos/catalogo';
import type { Producto } from '../datos/producto';

@Component({
  selector: 'app-tarjeta-producto',
  templateUrl: './tarjeta-producto.html',
  styleUrl: './tarjeta-producto.css',
})
export class TarjetaProducto {
  readonly producto = input.required<Producto>();
  /** Las primeras tarjetas cargan la foto sin esperar: suelen ser lo primero que se ve. */
  readonly prioritaria = input(false);
  readonly abrir = output<Producto>();

  protected readonly fotoFallida = signal(false);
  protected readonly formatearPrecio = formatearPrecio;
}
