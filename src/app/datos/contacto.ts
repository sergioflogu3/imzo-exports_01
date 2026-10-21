// Datos de contacto del vendedor y enlace de WhatsApp (RF-32, RF-33, RF-34).

export const NUMERO_WHATSAPP = '+591 64134927';

export const MENSAJE_WHATSAPP = 'Hola, vi el catálogo de IMZO y quiero consultar por un producto.';

export const URL_FACEBOOK = 'https://www.facebook.com/share/19TqYfiF6o/';
export const URL_TIKTOK = 'https://www.tiktok.com/@imzo216';

/** Ruta del logo dentro de public/; null muestra el texto "IMZO" (RF-32). */
export const LOGO: string | null = 'logo-web.jpg';

export function crearEnlaceWhatsapp(numero: string, mensaje: string): string {
  const enlace = `https://wa.me/${numero.replace(/\D/g, '')}`;
  return mensaje ? `${enlace}?text=${encodeURIComponent(mensaje)}` : enlace;
}
