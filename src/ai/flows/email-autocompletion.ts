'use server';

/**
 * @fileOverview This file defines a Genkit flow for email autocompletion.
 *
 * - emailAutocompletion - A function that uses AI to autocomplete parts of an email.
 * - EmailAutocompletionInput - The input type for the emailAutocompletion function.
 * - EmailAutocompletionOutput - The return type for the emailAutocompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmailAutocompletionInputSchema = z.object({
  template: z
    .string()
    .describe('The email template with placeholders for recipient data.'),
  commonStructures: z
    .string()
    .describe(
      'Key ideas or phrases to incorporate into the email.'
    ),
});

export type EmailAutocompletionInput = z.infer<
  typeof EmailAutocompletionInputSchema
>;

const EmailAutocompletionOutputSchema = z.object({
  completedEmail: z
    .string()
    .describe('The autocompleted email with recipient data incorporated.'),
});

export type EmailAutocompletionOutput = z.infer<
  typeof EmailAutocompletionOutputSchema
>;

export async function emailAutocompletion(
  input: EmailAutocompletionInput
): Promise<EmailAutocompletionOutput> {
  return emailAutocompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'emailAutocompletionPrompt',
  input: {schema: EmailAutocompletionInputSchema},
  output: {schema: EmailAutocompletionOutputSchema},
  prompt: `You are an expert writing assistant. Your task is to refine and improve an email template based on a user's key ideas.

**Instructions:**
1.  Read the original email template provided by the user.
2.  Read the key ideas or phrases the user wants to include.
3.  Rewrite the email template to be more professional, clear, and persuasive, incorporating the user's key ideas.
4.  **Crucially, you MUST preserve all placeholders in the format \`{{placeholder_name}}\` or \`{{invoice_details}}\`. Do not replace them with example data.** The output should be a generic template, not a filled-in email.

Original Email Template:
{{template}}

Key Ideas to Incorporate:
{{commonStructures}}

Refined Email Template:`,
});

const emailAutocompletionFlow = ai.defineFlow(
  {
    name: 'emailAutocompletionFlow',
    inputSchema: EmailAutocompletionInputSchema,
    outputSchema: EmailAutocompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
