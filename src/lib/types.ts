export interface Recipient {
  ruc: string;
  codigo: string;
  nombre: string;
  correo: string;
}

export interface Invoice {
  tipo_comprobante: string;
  serie_comprobante: string;
  ruc: string;
  razon_social: string;
  observaciones: string;
}

export interface GroupedData {
  recipient: Recipient;
  invoices: Invoice[];
}
