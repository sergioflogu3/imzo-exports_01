import { Component, ElementRef, input, model, viewChild } from '@angular/core';
import { LONGITUD_MAXIMA_BUSQUEDA } from '../datos/busqueda';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.html',
  styleUrl: './buscador.css',
})
export class Buscador {
  /** Texto tal como se escribe; los resultados los calcula quien lo recibe (principio 3). */
  readonly texto = model('');
  /** "{n} productos", o null si no hay que mostrarlo (RF-14). */
  readonly contador = input<string | null>(null);

  protected readonly longitudMaxima = LONGITUD_MAXIMA_BUSQUEDA;
  private readonly campo = viewChild.required<ElementRef<HTMLInputElement>>('campo');

  /** Vacía el campo y le devuelve el foco (RF-12, RF-16). */
  borrar(): void {
    this.texto.set('');
    this.campo().nativeElement.focus();
  }

  protected actualizar(evento: Event): void {
    this.texto.set((evento.target as HTMLInputElement).value);
  }

  protected alPulsarTecla(evento: KeyboardEvent): void {
    // Mientras se compone una letra (tildes, teclado predictivo), Enter solo la confirma.
    if (evento.key === 'Enter' && !evento.isComposing) {
      // Oculta el teclado del móvil; no hay formulario que enviar (RF-6).
      this.campo().nativeElement.blur();
    } else if (evento.key === 'Escape' && this.texto() !== '') {
      evento.preventDefault();
      this.borrar(); // RF-13
    }
  }
}
