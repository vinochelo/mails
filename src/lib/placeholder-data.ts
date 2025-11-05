import type { Recipient, Invoice } from '@/lib/types';

export const placeholderRecipients: Recipient[] = [
  {
    ruc: '17928904380',
    codigo: 'P001',
    nombre: '360CORP S.A.',
    correo: 'contacto@360corp.com',
  },
  {
    ruc: '17929809410',
    codigo: 'P002',
    nombre: 'A&DTRADING',
    correo: 'contacto@adtrading.com',
  },
  {
    ruc: '09921248570',
    codigo: 'P003',
    nombre: 'ALESSA S.A.',
    correo: 'contacto@alessa.com',
  },
    {
    ruc: '01900075100',
    codigo: 'P004',
    nombre: 'ALMACENES JUAN ELJURI CÍA. LTDA.',
    correo: 'contacto@juaneljuri.com',
  },
];

export const placeholderInvoices: Invoice[] = [
  {
    tipo_comprobante: 'Factura',
    serie_comprobante: '001-181-000067113',
    ruc_emisor: '17928904380',
    razon_social_emisor: '360CORP S.A.',
    observaciones: 'PEDIDO NO RECIBIDO ANULAR FACTURA',
  },
  {
    tipo_comprobante: 'Factura',
    serie_comprobante: '001-002-000006323',
    ruc_emisor: '17929809410',
    razon_social_emisor: 'A&DTRADING DISTRIBUIDORES DE PRODUCTOS DE TECNOLOG',
    observaciones: 'material no recibido venta en verde',
  },
  {
    tipo_comprobante: 'Factura',
    serie_comprobante: '001-331-000012800',
    ruc_emisor: '09921248570',
    razon_social_emisor: 'ALESSA S.A.',
    observaciones: 'MATERIAL NO RECIBIDO ANULAR LA FACTURA',
  },
  {
    tipo_comprobante: 'Factura',
    serie_comprobante: '001-001-000236388',
    ruc_emisor: '01900075100',
    razon_social_emisor: 'ALMACENES JUAN ELJURI CÍA. LTDA.',
    observaciones: 'MATERIAL RECIBIDO EN DICIEMBRE CON FC 229831 segur oc de la factura',
  },
  {
    tipo_comprobante: 'Factura',
    serie_comprobante: '001-001-000236577',
    ruc_emisor: '01900075100',
    razon_social_emisor: 'ALMACENES JUAN ELJURI CÍA. LTDA.',
    observaciones: 'MATERIAL RECIBIDO EN DICIEMBRE CON FC 229831 segur oc de la factura',
  },
  {
    tipo_comprobante: 'Factura',
    serie_comprobante: '001-001-000236910',
    ruc_emisor: '01900075100',
    razon_social_emisor: 'ALMACENES JUAN ELJURI CÍA. LTDA.',
    observaciones: 'material no recibido venta en verde',
  },
    {
    tipo_comprobante: 'Factura',
    serie_comprobante: '009-001-000120559',
    ruc_emisor: '01900075100',
    razon_social_emisor: 'ALMACENES JUAN ELJURI CÍA. LTDA.',
    observaciones: 'material no recibido venta en verde',
  },
];
