import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { formatearPrecio } from '../datos/catalogo';
import type { Producto } from '../datos/producto';
import { BotonWhatsapp } from '../boton-whatsapp/boton-whatsapp';

@Component({
  selector: 'app-detalle-producto',
  imports: [BotonWhatsapp],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProducto {
  readonly producto = input.required<Producto>();
  readonly cerrar = output<void>();

  protected readonly seleccionada = signal(0);
  protected readonly fotosFallidas = signal<ReadonlySet<number>>(new Set());
  protected readonly fotoGrande = computed(() => this.producto().fotografias[this.seleccionada()]);
  protected readonly tieneDescripcion = computed(() => this.producto().descripcion.trim() !== '');
  protected readonly formatearPrecio = formatearPrecio;

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // showModal() da Escape, foco atrapado y el resto de la página inerte (RF-26).
    afterNextRender(() => this.dialogo().nativeElement.showModal());
  }

  protected cerrarDialogo(): void {
    this.dialogo().nativeElement.close();
  }

  /** Un clic cuyo destino es el propio <dialog> cae fuera del contenido (RF-26). */
  protected alPulsarDialogo(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) this.cerrarDialogo();
  }

  protected marcarFallida(indice: number): void {
    this.fotosFallidas.update((fallidas) => new Set(fallidas).add(indice));
  }
}
