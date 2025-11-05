export interface Recipient {
  RUC: string;
  CODIGO: string;
  NOMBRE: string;
  CORREO: string;
}

export interface Invoice {
  'TIPO_COMPROBANTE': string;
  'SERIE_COMPROBANTE': string;
  'RUC_EMISOR': string;
  'RAZON_SOCIAL_EMISOR': string;
  'OBSERVACIONES': string;
}

export interface GroupedData {
  recipient: Recipient;
  invoices: Invoice[];
}
