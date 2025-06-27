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
  recipientData: z.record(z.string()).describe('Recipient-specific data.'),
  commonStructures: z
    .string()
    .describe(
      'Common sentence structures or phrases to be used for autocompletion.'
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
  prompt: `You are an AI-powered email assistant that helps users autocomplete parts of their emails.

  Based on the following email template, recipient-specific data, and common sentence structures, generate a completed email.

  Email Template:
  {{template}}

  Recipient Data:
  {{#each recipientData}}
    {{@key}}: {{{this}}}
  {{/each}}

  Common Sentence Structures:
  {{commonStructures}}

  Completed Email:`,
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
