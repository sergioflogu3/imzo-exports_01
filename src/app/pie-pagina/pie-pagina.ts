import { Component } from '@angular/core';
import { LOGO, URL_FACEBOOK, URL_TIKTOK } from '../datos/contacto';

@Component({
  selector: 'app-pie-pagina',
  templateUrl: './pie-pagina.html',
  styleUrl: './pie-pagina.css',
})
export class PiePagina {
  protected readonly logo = LOGO;
  protected readonly urlFacebook = URL_FACEBOOK;
  protected readonly urlTiktok = URL_TIKTOK;
}
