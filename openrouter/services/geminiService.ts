import { OpenRouter } from "@openrouter/sdk";
import { Question } from '../types';

// Legg inn din gratis OpenRouter-nøkkel her
const API_KEY = "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";

const openrouter = new OpenRouter({
  apiKey: API_KEY
});

const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export const generateClarifyingQuestions = async (lazyPrompt: string): Promise<Question[]> => {
    const questionPrompt = `
        Du er en ekspert på prompt engineering. Analyser brukerens "lazy prompt" og generer nøyaktig 3 oppfølgingsspørsmål på norsk.
        Returner KUN et gyldig JSON-array med feltene: id, title, description, placeholder, examples (array).
        Lazy prompt: "${lazyPrompt}"
    `;

    try {
        const response = await openrouter.chat.send({
            model: MODEL,
            messages: [{ role: "user", content: questionPrompt }]
        });

        const text = response.choices[0]?.message?.content || "";
        const sanitizedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(sanitizedText);
    } catch (error) {
        console.error("OpenRouter Error:", error);
        throw new Error("Kunne ikke hente spørsmål.");
    }
}

export const generatePrompt = async (
    lazyPrompt: string,
    questions: Question[],
    answers: string[],
    refinement: string
): Promise<string> => {
  const context = questions.map((q, i) => answers[i] ? `${q.title}: ${answers[i]}` : null).filter(Boolean).join('\n');

  const fullPrompt = `
    Lag en profesjonell prompt basert på:
    Opprinnelig: ${lazyPrompt}
    Kontekst: ${context}
    Justeringer: ${refinement}

    Bruk overskriftene: **Situasjon**, **Oppgave**, **Mål**, **Kunnskap**.
    Returner kun selve prompten i Markdown-format.
  `;

  try {
    const response = await openrouter.chat.send({
      model: MODEL,
      messages: [{ role: "user", content: fullPrompt }]
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    throw new Error("Kunne ikke generere prompt.");
  }
};
