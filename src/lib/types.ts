export interface Recipient {
  RUC: string;
  CODIGO: string;
  NOMBRE: string;
  CORREO: string;
}

export interface Invoice {
  tipo_comprobante: string;
  serie_comprobante: string;
  ruc_emisor: string;
  razon_social_emisor: string;
  observaciones: string;
}

export interface GroupedData {
  recipient: Recipient;
  invoices: Invoice[];
}
