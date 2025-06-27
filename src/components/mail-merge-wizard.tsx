"use client";

import React, { useState, useMemo } from 'react';
import { UploadCloud, FileCheck2, Columns, MailPlus, Sparkles, Eye, Download, Send, ChevronRight, ChevronLeft, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { emailAutocompletion } from '@/ai/flows/email-autocompletion';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock data to simulate Excel file parsing
const mockEmailFile = {
  name: 'destinatarios.xlsx',
  size: 4096,
  headers: ['RUC', 'CODIGO', 'NOMBRE', 'CORREO'],
  rows: [
    { RUC: '0992124857001', CODIGO: '110000002', NOMBRE: 'ALESSA S.A.', CORREO: 'fabian.davila@alessa.com.ec, gtumbaco@alessa.com.ec, jlucas@alessa.com.ec' },
    { RUC: '0190007510001', CODIGO: '110000003', NOMBRE: 'ALMACENES JUAN ELJURI CIA. LTDA.', CORREO: 'cobranzaselectro@eljuric.com, ep_web@eljuric.com, facturacionperfumeria@eljuric.com, mjara@eljuric.com' },
    { RUC: '0992264373001', CODIGO: '110001686', NOMBRE: 'ALPHACELL S.A.', CORREO: 'andres.mata@alphacell.com.ec, claudia.ochoa@alphacell.com.ec' },
    { RUC: '1792566436001', CODIGO: '110000272', NOMBRE: 'ALTIDAT S A', CORREO: 'fsalgado@alti.com.ec, ventas@alti.com.ec' },
    { RUC: '1792201160001', CODIGO: '110001717', NOMBRE: 'ASERTIA COMERCIAL S.A.', CORREO: 'efrain.aviles@asertia.com.ec' },
    { RUC: '0991400427001', CODIGO: '110001217', NOMBRE: 'CARTIMEX S.A.', CORREO: 'dyanez@uio.cartimex.com, marco.ajitimbay@uio.cartimex.com, vanessa.garcia@uio.cartimex.com' },
    { RUC: '1790241483001', CODIGO: '110001565', NOMBRE: 'CHAIDE Y CHAIDE S.A.', CORREO: 'david.corrales@chaideychaide.com, erik.cabrera@chaideychaide.com, jenny.castillo@chaideychaide.com, karen.montesdeoca@chaideychaide.com' },
    { RUC: '1791341899001', CODIGO: '110000020', NOMBRE: 'CORPMUNAB SOCIEDAD ANONIMA', CORREO: 'cartera@mabel.com.ec, contabilidad@mabel.com.ec, contabilidad1@mabel.com.ec, mccevallos@mabel.com.ec' },
    { RUC: '0992146036001', CODIGO: '110001721', NOMBRE: 'COTZUL S.A.', CORREO: 'cobranzas@cotzul.com, info@cotzul.com' },
    { RUC: '0993211133001', CODIGO: '110001629', NOMBRE: 'DISLINIBACORP C.A.', CORREO: 'dislinibacorp@gmail.com' },
    { RUC: '1790854035001', CODIGO: '110000345', NOMBRE: 'ELECTROLUX C.A.', CORREO: 'alexander.ruiz@electrolux.com, bolivar.cruz@electrolux.com, cristobal.viteri@electrolux.com, finanzasec@electrolux.com, paola.freire@electrolux.com' },
    { RUC: '1792983630001', CODIGO: '110001730', NOMBRE: 'HOMEINNOVATIONS TECHNOLOGY CIA LTDA', CORREO: 'contabilidad@urbandata.ec, ventas@urbandata.es' },
    { RUC: '0190003701001', CODIGO: '110000466', NOMBRE: 'IMPORTADORA TOMEBAMBA S.A.', CORREO: 'camila.chiriboga@tomebamba.com.ec, elias.valencia@tomebamba.com.ec' },
    { RUC: '1791743148001', CODIGO: '110000192', NOMBRE: 'INTCOMEX DEL ECUADOR S.A.', CORREO: 'jvicente@intcomex.com, pcriollo@intcomex.com' },
    { RUC: '0991248021001', CODIGO: '110000039', NOMBRE: 'LANSEY S.A.', CORREO: 'aulloa@lansey.com, rreascos@lansey.com, t04@lansey.com' },
    { RUC: '0992239867001', CODIGO: '110000327', NOMBRE: 'LIVANSUD S.A.', CORREO: 'contadora@livansud.com, cuentasclave@livansud.com, facturacion@livansud.com' },
    { RUC: '1804739082001', CODIGO: '110000242', NOMBRE: 'MEZA CASTRO GABRIELA CAROLINA', CORREO: 'icamoda@yahoo.com' },
    { RUC: '1792138337001', CODIGO: '110001704', NOMBRE: 'MUEBLEFACIL CIA. LTDA.', CORREO: 'comercial@mueblefacil.com, facturacion@mueblefacil.com, ventas@mueblefacil.com' },
    { RUC: '0990299390001', CODIGO: '110001818', NOMBRE: 'MUEBLES EL BOSQUE S.A.', CORREO: 'cobranzas@muebleselbosque.com, gisella_moreno@muebleselbosque.com, raul_urdiales@muebleselbosque.com, retencion_clientes@muebleselbosque.com' },
    { RUC: '1792291666001', CODIGO: '110001518', NOMBRE: 'NOVISOLUTIONS CIA. LTDA', CORREO: 'sgallo@novisolutions.co' },
    { RUC: '1793208294001', CODIGO: '110001860', NOMBRE: 'OPENTECNOLOGY S.A.S.', CORREO: 'info@opentecnologyec.com, info@opentecnologyec.com.com, svaca@opentecnologyec.com' },
    { RUC: '0190453405001', CODIGO: '110001626', NOMBRE: 'RADIOCONTROL ELECTRONICS CIA. LTDA.', CORREO: 'jchele@gerardoortiz.com, jmartinez@gerardoortiz.com, mtapia@gerardoortiz.com' },
    { RUC: '1714332322001', CODIGO: '110001694', NOMBRE: 'ROMERO ROMERO PATRICIO ANIBAL', CORREO: 'comercial@gruporomdav.com' },
    { RUC: '0991515712001', CODIGO: '110000798', NOMBRE: 'SAFIED S.A.', CORREO: 'victor.narvaez@safied.com, diana.castro@safied.com' },
    { RUC: '0190370585001', CODIGO: '110001890', NOMBRE: 'SOCIEDAD ELECTRONICA S.A. SOCELEC', CORREO: 'asistente.administrativo@socelec.com.ec, coordinador.contable@socelec.com.ec, kam.cuenca@socelec.com.ec' },
    { RUC: '0190341992001', CODIGO: '110001625', NOMBRE: 'SURAMERICANA DE MOTORES MOTSUR CIA.', CORREO: 'cbustos@gerardoortiz.com' },
    { RUC: '1792030765001', CODIGO: '110000073', NOMBRE: 'TEXTILES KUSATROY CIA. LTDA.', CORREO: 'produccion@tkusatroy.com.ec' },
    { RUC: '0992479256001', CODIGO: '110001853', NOMBRE: 'VITAURO CIA. LTDA.', CORREO: 'abasurto@taurusecuador.com, ventas11@taurusecuador.com' },
  ],
};

const mockDataFile = {
  name: 'datos.xlsx',
  size: 2048,
  headers: ['TIPO_COMP', 'RUC', 'RAZON_SOCIAL_EMISOR', 'SERIE_COMPROBANTE', 'OBSERVACIONES'],
  rows: [
    { TIPO_COMP: 'Factura', RUC: '0992124857001', RAZON_SOCIAL_EMISOR: 'ALESSA S.A.', SERIE_COMPROBANTE: '001-102-003311339', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0992124857001', RAZON_SOCIAL_EMISOR: 'ALESSA S.A.', SERIE_COMPROBANTE: '001-331-000006432', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0992124857001', RAZON_SOCIAL_EMISOR: 'ALESSA S.A.', SERIE_COMPROBANTE: '001-331-000006538', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0992124857001', RAZON_SOCIAL_EMISOR: 'ALESSA S.A.', SERIE_COMPROBANTE: '001-331-000006545', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190007510001', RAZON_SOCIAL_EMISOR: 'ALMACENES JUAN ELJURI CIA. LTDA.', SERIE_COMPROBANTE: '001-001-000233066', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190007510001', RAZON_SOCIAL_EMISOR: 'ALMACENES JUAN ELJURI CIA. LTDA.', SERIE_COMPROBANTE: '052-002-000217011', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190007510001', RAZON_SOCIAL_EMISOR: 'ALMACENES JUAN ELJURI CIA. LTDA.', SERIE_COMPROBANTE: '052-002-000217012', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0992264373001', RAZON_SOCIAL_EMISOR: 'ALPHACELL S.A.', SERIE_COMPROBANTE: '001-002-000026717', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792566436001', RAZON_SOCIAL_EMISOR: 'ALTIDAT S A', SERIE_COMPROBANTE: '001-001-000027996', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792566436001', RAZON_SOCIAL_EMISOR: 'ALTIDAT S A', SERIE_COMPROBANTE: '001-001-000028142', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792566436001', RAZON_SOCIAL_EMISOR: 'ALTIDAT S A', SERIE_COMPROBANTE: '001-001-000028143', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792566436001', RAZON_SOCIAL_EMISOR: 'ALTIDAT S A', SERIE_COMPROBANTE: '001-001-000028353', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792566436001', RAZON_SOCIAL_EMISOR: 'ALTIDAT S A', SERIE_COMPROBANTE: '001-001-000028357', OBSERVaciones: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792201160001', RAZON_SOCIAL_EMISOR: 'ASERTIA COMERCIAL S.A.', SERIE_COMPROBANTE: '001-006-001975480', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792201160001', RAZON_SOCIAL_EMISOR: 'ASERTIA COMERCIAL S.A.', SERIE_COMPROBANTE: '001-006-001964503', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792201160001', RAZON_SOCIAL_EMISOR: 'ASERTIA COMERCIAL S.A.', SERIE_COMPROBANTE: '001-023-000010655', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0991400427001', RAZON_SOCIAL_EMISOR: 'CARTIMEX S.A.', SERIE_COMPROBANTE: '003-004-000114296', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0991400427001', RAZON_SOCIAL_EMISOR: 'CARTIMEX S.A.', SERIE_COMPROBANTE: '003-004-000114453', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0991400427001', RAZON_SOCIAL_EMISOR: 'CARTIMEX S.A.', SERIE_COMPROBANTE: '003-004-000114993', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1790241483001', RAZON_SOCIAL_EMISOR: 'CHAIDE Y CHAIDE S.A.', SERIE_COMPROBANTE: '001-005-000294139', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1790241483001', RAZON_SOCIAL_EMISOR: 'CHAIDE Y CHAIDE S.A.', SERIE_COMPROBANTE: '001-005-000296053', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1790241483001', RAZON_SOCIAL_EMISOR: 'CHAIDE Y CHAIDE S.A.', SERIE_COMPROBANTE: '001-005-000297627', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1790241483001', RAZON_SOCIAL_EMISOR: 'CHAIDE Y CHAIDE S.A.', SERIE_COMPROBANTE: '001-005-000297628', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1790241483001', RAZON_SOCIAL_EMISOR: 'CHAIDE Y CHAIDE S.A.', SERIE_COMPROBANTE: '001-005-000297629', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1791341899001', RAZON_SOCIAL_EMISOR: 'CORPMUNAB SOCIEDAD ANONIMA', SERIE_COMPROBANTE: '002-200-000050751', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1791341899001', RAZON_SOCIAL_EMISOR: 'CORPMUNAB SOCIEDAD ANONIMA', SERIE_COMPROBANTE: '002-200-000051052', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1791341899001', RAZON_SOCIAL_EMISOR: 'CORPMUNAB SOCIEDAD ANONIMA', SERIE_COMPROBANTE: '002-200-000051062', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0992146036001', RAZON_SOCIAL_EMISOR: 'COTZUL S.A.', SERIE_COMPROBANTE: '005-001-000042191', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0993211133001', RAZON_SOCIAL_EMISOR: 'DISLINIBACORP C.A.', SERIE_COMPROBANTE: '001-002-000013419', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0993211133001', RAZON_SOCIAL_EMISOR: 'DISLINIBACORP C.A.', SERIE_COMPROBANTE: '001-002-000013420', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1790854035001', RAZON_SOCIAL_EMISOR: 'ELECTROLUX C.A.', SERIE_COMPROBANTE: '009-001-000021938', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1790854035001', RAZON_SOCIAL_EMISOR: 'ELECTROLUX C.A.', SERIE_COMPROBANTE: '009-001-000022476', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1790854035001', RAZON_SOCIAL_EMISOR: 'ELECTROLUX C.A.', SERIE_COMPROBANTE: '009-001-000022477', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792983630001', RAZON_SOCIAL_EMISOR: 'HOMEINNOVATIONS TECHNOLOGY S.A.S.', SERIE_COMPROBANTE: '001-010-000000944', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190003701001', RAZON_SOCIAL_EMISOR: 'IMPORTADORA TOMEBAMBA S.A.', SERIE_COMPROBANTE: '047-101-000002186', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1791743148001', RAZON_SOCIAL_EMISOR: 'INTCOMEX DEL ECUADOR S.A.', SERIE_COMPROBANTE: '001-001-000060400', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0991248021001', RAZON_SOCIAL_EMISOR: 'LANSEY S.A.', SERIE_COMPROBANTE: '001-040-020566469', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0992239867001', RAZON_SOCIAL_EMISOR: 'LIVANSUD S.A.', SERIE_COMPROBANTE: '007-208-000001800', OBSERVACIONES: 'SERVICIO SIN ORDEN DE COMPRA' },
    { TIPO_COMP: 'Factura', RUC: '1804739082001', RAZON_SOCIAL_EMISOR: 'MEZA CASTRO GABRIELA CAROLINA', SERIE_COMPROBANTE: '001-011-000004836', OBSERVACIONES: 'INGRESADO CON FC 4837' },
    { TIPO_COMP: 'Factura', RUC: '1792138337001', RAZON_SOCIAL_EMISOR: 'MUEBLEFACIL CIA. LTDA.', SERIE_COMPROBANTE: '003-002-000017629', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0990299390001', RAZON_SOCIAL_EMISOR: 'MUEBLES EL BOSQUE S.A.', SERIE_COMPROBANTE: '001-032-000007913', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0990299390001', RAZON_SOCIAL_EMISOR: 'MUEBLES EL BOSQUE S.A.', SERIE_COMPROBANTE: '001-032-000007914', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0990299390001', RAZON_SOCIAL_EMISOR: 'MUEBLES EL BOSQUE S.A.', SERIE_COMPROBANTE: '001-032-000007936', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0990299390001', RAZON_SOCIAL_EMISOR: 'MUEBLES EL BOSQUE S.A.', SERIE_COMPROBANTE: '001-032-000007944', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0990299390001', RAZON_SOCIAL_EMISOR: 'MUEBLES EL BOSQUE S.A.', SERIE_COMPROBANTE: '001-032-000007951', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792291666001', RAZON_SOCIAL_EMISOR: 'NOVISOLUTIONS CIA. LTDA', SERIE_COMPROBANTE: '026-001-000014433', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792291666001', RAZON_SOCIAL_EMISOR: 'NOVISOLUTIONS CIA. LTDA', SERIE_COMPROBANTE: '026-001-000014435', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792291666001', RAZON_SOCIAL_EMISOR: 'NOVISOLUTIONS CIA. LTDA', SERIE_COMPROBANTE: '026-001-000014437', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792291666001', RAZON_SOCIAL_EMISOR: 'NOVISOLUTIONS CIA. LTDA', SERIE_COMPROBANTE: '026-001-000014440', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1792291666001', RAZON_SOCIAL_EMISOR: 'NOVISOLUTIONS CIA. LTDA', SERIE_COMPROBANTE: '026-001-000014442', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1793208294001', RAZON_SOCIAL_EMISOR: 'OPENTECNOLOGY S.A.S.', SERIE_COMPROBANTE: '001-002-000003130', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1793208294001', RAZON_SOCIAL_EMISOR: 'OPENTECNOLOGY S.A.S.', SERIE_COMPROBANTE: '001-002-000003278', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190453405001', RAZON_SOCIAL_EMISOR: 'RADIOCONTROL ELECTRONICS CIA. LTDA.', SERIE_COMPROBANTE: '001-605-000029460', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190453405001', RAZON_SOCIAL_EMISOR: 'RADIOCONTROL ELECTRONICS CIA. LTDA.', SERIE_COMPROBANTE: '001-605-000029461', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190453405001', RAZON_SOCIAL_EMISOR: 'RADIOCONTROL ELECTRONICS CIA. LTDA.', SERIE_COMPROBANTE: '001-605-000029462', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190453405001', RAZON_SOCIAL_EMISOR: 'RADIOCONTROL ELECTRONICS CIA. LTDA.', SERIE_COMPROBANTE: '001-605-000029472', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '1714332322001', RAZON_SOCIAL_EMISOR: 'ROMERO ROMERO PATRICIO ANIBAL', SERIE_COMPROBANTE: '001-002-000000473', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0991515712001', RAZON_SOCIAL_EMISOR: 'SAFIED S.A.', SERIE_COMPROBANTE: '005-005-000002152', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0991515712001', RAZON_SOCIAL_EMISOR: 'SAFIED S.A.', SERIE_COMPROBANTE: '005-005-000002163', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190370585001', RAZON_SOCIAL_EMISOR: 'SOCIEDAD ELECTRONICA S.A. SOCELEC', SERIE_COMPROBANTE: '003-001-000004289', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190370585001', RAZON_SOCIAL_EMISOR: 'SOCIEDAD ELECTRONICA S.A. SOCELEC', SERIE_COMPROBANTE: '003-001-000004290', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190370585001', RAZON_SOCIAL_EMISOR: 'SOCIEDAD ELECTRONICA S.A. SOCELEC', SERIE_COMPROBANTE: '003-001-000004291', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190370585001', RAZON_SOCIAL_EMISOR: 'SOCIEDAD ELECTRONICA S.A. SOCELEC', SERIE_COMPROBANTE: '003-001-000004292', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190370585001', RAZON_SOCIAL_EMISOR: 'SOCIEDAD ELECTRONICA S.A. SOCELEC', SERIE_COMPROBANTE: '003-001-000004353', OBSERVACIONES: 'MATERIAL CON DIFERENCIA CAMBIO DE FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0190341992001', RAZON_SOCIAL_EMISOR: 'SURAMERICANA DE MOTORES MOTSUR CIA. LTDA.', SERIE_COMPROBANTE: '007-601-000019994', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA/SIN ORDEN DE COMPRA' },
    { TIPO_COMP: 'Factura', RUC: '0190341992001', RAZON_SOCIAL_EMISOR: 'SURAMERICANA DE MOTORES MOTSUR CIA. LTDA.', SERIE_COMPROBANTE: '007-601-000019995', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA/SIN ORDEN DE COMPRA' },
    { TIPO_COMP: 'Factura', RUC: '1792030765001', RAZON_SOCIAL_EMISOR: 'TEXTILES KUSATROY CIA. LTDA.', SERIE_COMPROBANTE: '001-007-000004270', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
    { TIPO_COMP: 'Factura', RUC: '0992479256001', RAZON_SOCIAL_EMISOR: 'VITAURO CIA. LTDA.', SERIE_COMPROBANTE: '001-012-000049525', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA/SIN ORDEN DE COMPRA' },
    { TIPO_COMP: 'Factura', RUC: '0992479256001', RAZON_SOCIAL_EMISOR: 'VITAURO CIA. LTDA.', SERIE_COMPROBANTE: '001-012-000049659', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA/SIN ORDEN DE COMPRA' },
    { TIPO_COMP: 'Factura', RUC: '0992479256001', RAZON_SOCIAL_EMISOR: 'VITAURO CIA. LTDA.', SERIE_COMPROBANTE: '001-012-000049824', OBSERVACIONES: 'SIN RECIBIR EN CD ANULAR FACTURA' },
  ],
};


const FileDropzone = ({ title, file, onFileSelect, icon: Icon, description }) => (
  <div className="flex-1">
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg h-48">
          {file ? (
            <div className="text-center">
              <FileCheck2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <p className="font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              <Button variant="link" size="sm" className="mt-2" onClick={onFileSelect}>
                Cambiar archivo
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Simulación de carga de archivos</p>
              <Button onClick={onFileSelect}>Seleccionar Archivo</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);


const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, title: 'Subir Archivos', icon: UploadCloud },
    { num: 2, title: 'Mapear Columnas', icon: Columns },
    { num: 3, title: 'Crear Correo', icon: MailPlus },
    { num: 4, title: 'Vista Previa y Envío', icon: Send },
  ];
  return (
    <div className="flex items-start justify-center mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center text-center w-24">
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                currentStep > step.num ? 'bg-primary border-primary text-primary-foreground' :
                currentStep === step.num ? 'bg-primary/20 border-primary text-primary' :
                'bg-card border-border text-muted-foreground'
              )}
            >
              <step.icon className="w-6 h-6" />
            </div>
            <p className={cn(
              'mt-2 text-sm font-medium transition-colors duration-300',
              currentStep >= step.num ? 'text-foreground' : 'text-muted-foreground'
            )}>{step.title}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              'flex-auto border-t-2 mt-6 mx-4 transition-colors duration-300',
              currentStep > step.num ? 'border-primary' : 'border-border'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};


export default function MailMergeWizard() {
  const [step, setStep] = useState(1);
  const [emailsFile, setEmailsFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [mappings, setMappings] = useState({ emailRuc: '', emailAddress: '', dataRuc: '', dataFields: {} });
  const [emailTemplate, setEmailTemplate] = useState('Estimados señores de {{NOMBRE}},\n\nPor medio de la presente, solicitamos su ayuda con la anulación de las siguientes facturas ante el SRI.\n\nA continuación, el detalle de los comprobantes y el motivo de la anulación:\n\n{{invoice_details}}\n\nAgradecemos de antemano su gestión.\n\nSaludos cordiales,\nEl Equipo de MailMergeXLS');
  const [commonStructures, setCommonStructures] = useState('Solicitud de anulación. Anular facturas SRI. Motivo de anulación.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { toast } = useToast();

  const handleNextStep = () => setStep(s => Math.min(s + 1, 4));
  const handlePrevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const allDataFields = useMemo(() => {
    if (!dataFile) return [];
    return dataFile.headers.filter(h => h !== mappings.dataRuc);
  }, [dataFile, mappings.dataRuc]);

  const handleGenerateWithAI = async () => {
    if (!emailTemplate) {
      toast({ title: "Error", description: "El cuerpo del correo no puede estar vacío.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const template = emailTemplate;
      const res = await emailAutocompletion({ template, commonStructures });
      setEmailTemplate(res.completedEmail);
      toast({ title: "¡Éxito!", description: "El correo ha sido mejorado con IA." });
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({ title: "Error de IA", description: "No se pudo generar el texto.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGeneratePreviews = () => {
    setIsGenerating(true);
    // Simulate processing delay
    setTimeout(() => {
      try {
        const emailMap = new Map(mockEmailFile.rows.map(row => [String(row[mappings.emailRuc]), row[mappings.emailAddress]]));
        
        const dataByRuc = mockDataFile.rows.reduce((acc, row) => {
          const ruc = String(row[mappings.dataRuc]);
          if (!acc[ruc]) acc[ruc] = [];
          acc[ruc].push(row);
          return acc;
        }, {});

        const generatedPreviews = Object.entries(dataByRuc).map(([ruc, rows]) => {
          const to = emailMap.get(ruc) || 'No encontrado';
          let body = emailTemplate;
          
          const firstRow = rows[0];
          // Replace placeholders from data file first
          Object.entries(firstRow).forEach(([key, value]) => {
            const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            body = body.replace(placeholder, String(value));
          });
          
          const invoiceDetails = rows.map(row => `  • ${row.TIPO_COMP} ${row.SERIE_COMPROBANTE}: ${row.OBSERVACIONES}`).join('\n');
          body = body.replace(/\{\{invoice_details\}\}/g, invoiceDetails);
          
          // Then, replace placeholders from email file
          const emailRow = mockEmailFile.rows.find(eRow => String(eRow[mappings.emailRuc]) === ruc);
          let recipientName = ruc;
          if (emailRow) {
            Object.entries(emailRow).forEach(([key, value]) => {
              const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
              body = body.replace(placeholder, String(value));
            });
            recipientName = emailRow.NOMBRE || ruc;
          }

          return { to, body, recipient: recipientName };
        });

        setPreviews(generatedPreviews);
        setPreviewIndex(0);
        handleNextStep();
      } catch (error) {
        console.error("Preview generation failed:", error);
        toast({ title: "Error de Previsualización", description: "No se pudieron generar las vistas previas. Revisa el mapeo.", variant: "destructive" });
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 1: Subir Archivos de Excel</CardTitle>
              <CardDescription>Seleccione el archivo con los correos y el archivo con los datos para la combinación.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Modo de Simulación y Estructura de Archivos</AlertTitle>
                <AlertDescription>
                  <p>Esta es una demostración. La carga de archivos está simulada con datos de ejemplo. Para que la combinación funcione, sus archivos deben tener una estructura específica:</p>
                  <ul className="list-disc pl-5 mt-2 text-xs">
                    <li><b>Archivo de Correos:</b> Debe contener una columna para el identificador único (ej. <code>RUC</code>), el nombre del contacto (ej. <code>NOMBRE</code>) y el email (ej. <code>CORREO</code>).</li>
                    <li><b>Archivo de Datos:</b> Debe contener una columna con el mismo identificador único (ej. <code>RUC</code>) para cruzar los datos, y las columnas con la información que desea incluir en el correo (ej. <code>TIPO_COMP</code>, <code>SERIE_COMPROBANTE</code>, <code>OBSERVACIONES</code>).</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <div className="flex flex-col md:flex-row gap-6 mt-6">
                <FileDropzone title="Archivo de Correos" description="Contiene RUC y Correo Electrónico." file={emailsFile} onFileSelect={() => setEmailsFile(mockEmailFile)} icon={MailPlus} />
                <FileDropzone title="Archivo de Datos" description="Contiene RUC y datos a combinar." file={dataFile} onFileSelect={() => setDataFile(mockDataFile)} icon={Columns} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNextStep} disabled={!emailsFile || !dataFile} className="ml-auto">
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 2: Mapear Columnas</CardTitle>
              <CardDescription>Relacione las columnas de sus archivos con los campos requeridos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Archivo de Correos ({emailsFile?.name})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-ruc">Columna con RUC del destinatario</Label>
                            <Select value={mappings.emailRuc} onValueChange={(v) => setMappings(m => ({...m, emailRuc: v}))}>
                                <SelectTrigger id="email-ruc"><SelectValue placeholder="Seleccionar columna..." /></SelectTrigger>
                                <SelectContent>{emailsFile?.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email-address">Columna con correo electrónico</Label>
                            <Select value={mappings.emailAddress} onValueChange={(v) => setMappings(m => ({...m, emailAddress: v}))}>
                                <SelectTrigger id="email-address"><SelectValue placeholder="Seleccionar columna..." /></SelectTrigger>
                                <SelectContent>{emailsFile?.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="border-t pt-6">
                    <h3 className="font-semibold mb-2">Archivo de Datos ({dataFile?.name})</h3>
                     <div className="space-y-2">
                        <Label htmlFor="data-ruc">Columna con RUC para cruzar datos</Label>
                        <Select value={mappings.dataRuc} onValueChange={(v) => setMappings(m => ({...m, dataRuc: v}))}>
                            <SelectTrigger id="data-ruc"><SelectValue placeholder="Seleccionar columna..." /></SelectTrigger>
                            <SelectContent>{dataFile?.headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Atrás</Button>
              <Button onClick={handleNextStep} disabled={!mappings.emailRuc || !mappings.emailAddress || !mappings.dataRuc}>
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Paso 3: Crear Plantilla de Correo</CardTitle>
                    <CardDescription>Diseñe el correo que se enviará. Use placeholders para los datos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={emailTemplate}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        placeholder="Escriba su correo aquí..."
                        rows={15}
                        className="text-base"
                    />
                </CardContent>
            </Card>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Placeholders</CardTitle>
                        <CardDescription>Variables disponibles de sus archivos.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm max-h-32 overflow-y-auto">
                        <p className="font-semibold">Datos Generales:</p>
                        {allDataFields.map(f => <code key={f} className="block bg-muted p-1 rounded-sm my-1">&#123;&#123;{f}&#125;&#125;</code>)}
                        <p className="font-semibold mt-2">Datos de Correo:</p>
                        {emailsFile?.headers.map(f => <code key={f} className="block bg-muted p-1 rounded-sm my-1">&#123;&#123;{f}&#125;&#125;</code>)}
                        <p className="font-semibold mt-2">Detalles (Multi-línea):</p>
                        <code className="block bg-muted p-1 rounded-sm my-1">&#123;&#123;invoice_details&#125;&#125;</code>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="text-primary"/> Asistente con IA</CardTitle>
                        <CardDescription>Mejore su correo con inteligencia artificial.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="common-structures">Frases o ideas clave</Label>
                        <Textarea id="common-structures" value={commonStructures} onChange={(e) => setCommonStructures(e.target.value)} placeholder="Ej: Urgente, último aviso, etc." rows={2} />
                        <Button onClick={handleGenerateWithAI} disabled={isGenerating} className="w-full mt-4">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Mejorar con IA
                        </Button>
                    </CardContent>
                </Card>
                 <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Atrás</Button>
                    <Button onClick={handleGeneratePreviews} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                        Generar Vistas Previas
                    </Button>
                </div>
            </div>
          </div>
        );
       case 4:
        const currentPreview = previews[previewIndex];
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 4: Vista Previa y Envío</CardTitle>
              <CardDescription>Revise cada correo antes de enviarlo. Se encontraron {previews.length} destinatarios.</CardDescription>
            </CardHeader>
            <CardContent>
                {previews.length > 0 && currentPreview ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="font-medium">Destinatario {previewIndex + 1} de {previews.length}: <span className="font-normal text-muted-foreground">{currentPreview.recipient}</span></p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setPreviewIndex(p => Math.max(0, p - 1))} disabled={previewIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" onClick={() => setPreviewIndex(p => Math.min(previews.length - 1, p + 1))} disabled={previewIndex === previews.length - 1}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-card">
                            <p className="text-sm font-semibold">Para: <span className="font-normal">{currentPreview.to}</span></p>
                            <p className="text-sm font-semibold">Asunto: <span className="font-normal">Solicitud de Anulación de Facturas</span></p>
                            <div className="border-t my-2"></div>
                            <div className="whitespace-pre-wrap text-sm">{currentPreview.body}</div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No hay vistas previas para mostrar.</p>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}><ChevronLeft className="mr-2 h-4 w-4" /> Atrás</Button>
              <div className="flex gap-4">
                  <Button variant="secondary" onClick={() => toast({ title: 'Simulación', description: 'Función de descarga no implementada.'})}>
                      <Download className="mr-2 h-4 w-4"/> Descargar
                  </Button>
                  <Button onClick={() => toast({ title: 'Simulación', description: `Función de envío no implementada. Se enviarían ${previews.length} correos.`})}>
                      <Send className="mr-2 h-4 w-4"/> Enviar Correos
                  </Button>
              </div>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <StepIndicator currentStep={step} />
      {renderStep()}
    </div>
  );
}
