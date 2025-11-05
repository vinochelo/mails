export interface Recipient {
  RUC: string;
  CODIGO: string;
  NOMBRE: string;
  CORREO: string;
}

export interface Invoice {
  'Tipo Comprobante': string;
  'Serie Comprobante': string;
  'Ruc Emisor': string;
  'Razón Social Emisor': string;
  Observaciones: string;
}

export interface GroupedData {
  recipient: Recipient;
  invoices: Invoice[];
}