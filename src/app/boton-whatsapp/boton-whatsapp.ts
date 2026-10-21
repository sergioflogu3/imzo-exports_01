import { Component } from '@angular/core';
import { MENSAJE_WHATSAPP, NUMERO_WHATSAPP, crearEnlaceWhatsapp } from '../datos/contacto';

@Component({
  selector: 'app-boton-whatsapp',
  templateUrl: './boton-whatsapp.html',
  styleUrl: './boton-whatsapp.css',
})
export class BotonWhatsapp {
  protected readonly enlace = crearEnlaceWhatsapp(NUMERO_WHATSAPP, MENSAJE_WHATSAPP);
}
