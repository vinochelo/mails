'use server';

import { Resend } from 'resend';
import { z } from 'zod';

// NOTE: You must have a RESEND_API_KEY in your .env file.
// You can get one from https://resend.com/
//
// You will also need to verify a domain with Resend to use a custom 'from' address.
// For testing, you can use 'onboarding@resend.dev', but emails will only be sent
// to your own verified email address (the one you signed up with).
const resend = new Resend(process.env.RESEND_API_KEY);

const EmailSchema = z.object({
  to: z.string().email(),
  recipient: z.string(),
  body: z.string(),
});

type Preview = z.infer<typeof EmailSchema>;

export async function sendEmailsAction(previews: Preview[]) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "La clave de API de Resend no está configurada. Añade RESEND_API_KEY a tu archivo .env" };
  }

  try {
    const payload = previews.map(p => ({
        // IMPORTANT: For production, replace 'onboarding@resend.dev' with your own verified domain.
        from: 'MailMergeXLS <onboarding@resend.dev>',
        to: p.to,
        subject: 'Solicitud de Anulación de Facturas',
        // Using <pre> tag to preserve line breaks and formatting from the textarea
        html: `<pre style="font-family: sans-serif; font-size: 14px;">${p.body}</pre>`
    }));

    const { data, error } = await resend.batch.send(payload);

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error: `Error al enviar correos: ${error.message}` };
    }
    
    const successfulCount = data?.filter(d => d.id).length || 0;
    const failedCount = previews.length - successfulCount;

    if (failedCount > 0) {
        return { success: false, error: `Se enviaron ${successfulCount} correos, pero fallaron ${failedCount}. Revisa los logs del servidor.` };
    }

    return { success: true, message: `¡Se enviaron ${successfulCount} correos con éxito!` };

  } catch (e) {
    const error = e as Error;
    console.error("Failed to send emails:", error);
    return { success: false, error: `Ocurrió un error inesperado: ${error.message}` };
  }
}
