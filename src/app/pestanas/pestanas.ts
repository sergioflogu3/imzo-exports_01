import { Component, ElementRef, input, model, viewChildren } from '@angular/core';
import { SECCIONES, pestanaSiguiente, type Seccion } from '../datos/secciones';

@Component({
  selector: 'app-pestanas',
  templateUrl: './pestanas.html',
  styleUrl: './pestanas.css',
})
export class Pestanas {
  /** Pestaña activa; quien la recibe decide qué productos se muestran (principio 3). */
  readonly seleccionada = model.required<Seccion>();
  /** id del panel que muestran las pestañas (RF-7). */
  readonly controla = input.required<string>();

  protected readonly secciones = SECCIONES;
  private readonly botones = viewChildren<ElementRef<HTMLButtonElement>>('pestana');

  protected alPulsarTecla(evento: KeyboardEvent): void {
    const siguiente = pestanaSiguiente(this.seleccionada(), evento.key);
    if (!siguiente) return;
    evento.preventDefault();
    this.seleccionada.set(siguiente);
    // El foco pasa a la pestaña nueva sin desplazar la página (RF-8, RF-10).
    const indice = this.secciones.findIndex((s) => s.id === siguiente);
    this.botones()[indice]?.nativeElement.focus({ preventScroll: true });
  }
}
