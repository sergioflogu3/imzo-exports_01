import { Component } from '@angular/core';
import { BotonWhatsapp } from './boton-whatsapp/boton-whatsapp';
import { Catalogo } from './catalogo/catalogo';
import { LOGO } from './datos/contacto';
import { PiePagina } from './pie-pagina/pie-pagina';

@Component({
  selector: 'app-root',
  imports: [Catalogo, PiePagina, BotonWhatsapp],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly logo = LOGO;
}
