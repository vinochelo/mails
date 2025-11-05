import type { Recipient, Invoice } from '@/lib/types';

export const placeholderRecipients: Recipient[] = [
  {
    ruc: '20601891917',
    codigo: 'P001',
    nombre: 'Juan Pérez',
    correo: 'juan.perez@techcorp.com',
  },
  {
    ruc: '20550098765',
    codigo: 'P002',
    nombre: 'Maria Garcia',
    correo: 'maria.garcia@innovate.pe',
  },
  {
    ruc: '20459876543',
    codigo: 'P003',
    nombre: 'Carlos Rodriguez',
    correo: 'carlos.rodriguez@globalsys.net',
  },
];

export const placeholderInvoices: Invoice[] = [
  {
    tipo_comprobante: 'Factura Electrónica',
    serie_comprobante: 'F001-0123',
    ruc: '20601891917',
    razon_social: 'TECHCORP S.A.C.',
    observaciones: 'Servicio de consultoría mes de Abril.',
  },
  {
    tipo_comprobante: 'Factura Electrónica',
    serie_comprobante: 'F001-0128',
    ruc: '20601891917',
    razon_social: 'TECHCORP S.A.C.',
    observaciones: 'Licenciamiento de software.',
  },
  {
    tipo_comprobante: 'Recibo por Honorarios',
    serie_comprobante: 'E001-0056',
    ruc: '20601891917',
    razon_social: 'TECHCORP S.A.C.',
    observaciones: 'Servicios profesionales de diseño.',
  },
  {
    tipo_comprobante: 'Factura Electrónica',
    serie_comprobante: 'F002-4321',
    ruc: '20550098765',
    razon_social: 'INNOVATE PERU S.A.',
    observaciones: 'Compra de equipo de cómputo.',
  },
  {
    tipo_comprobante: 'Factura Electrónica',
    serie_comprobante: 'F002-4325',
    ruc: '20550098765',
    razon_social: 'INNOVATE PERU S.A.',
    observaciones: 'Mantenimiento de servidores.',
  },
  {
    tipo_comprobante: 'Boleta de Venta Electrónica',
    serie_comprobante: 'B001-9876',
    ruc: '20459876543',
    razon_social: 'GLOBAL SYSTEMS E.I.R.L.',
    observaciones: 'Soporte técnico.',
  },
];
