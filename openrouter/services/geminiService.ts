import { OpenRouter } from "@openrouter/sdk";
import { Question } from '../types';

// Sett inn din gratis API-nøkkel her
const API_KEY = "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";

const openrouter = new OpenRouter({
  apiKey: API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173", // Valgfritt: Nettsiden din
    "X-Title": "Navig-r",
  }
});

const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export const generateClarifyingQuestions = async (lazyPrompt: string): Promise<Question[]> => {
    const questionPrompt = `
        You are an expert prompt engineer. Your task is to analyze a user's 'lazy prompt' and generate exactly 3 insightful clarifying questions that will help refine it into a great prompt.

        Return these questions as a valid JSON array. Each object in the array must have the following keys:
        - "id": a unique number for each question (1, 2, 3).
        - "title": a string, the question itself, in Norwegian.
        - "description": a string, a short one-sentence explanation of why the question is being asked, in Norwegian.
        - "placeholder": a string, giving the user a hint about what to write, in Norwegian.
        - "examples": an array of 3 short, helpful string examples for the user to click, in Norwegian.

        Return ONLY the JSON array.
        Lazy prompt: "${lazyPrompt}"
    `;

    try {
        const response = await openrouter.chat.send({
            model: MODEL,
            messages: [{ role: "user", content: questionPrompt }]
        });

        const text = response.choices[0]?.message?.content || "";
        const sanitizedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(sanitizedText);
        
        return questions.map((q: any, index: number) => ({
            id: q.id || index + 1,
            title: q.title || 'Uten navn',
            description: q.description || 'Vennligst utdyp.',
            placeholder: q.placeholder || 'Skriv her...',
            examples: q.examples || []
        }));

    } catch (error) {
        console.error("OpenRouter Error (Questions):", error);
        throw new Error("Kunne ikke generere spørsmål via OpenRouter.");
    }
}

export const generatePrompt = async (
    lazyPrompt: string,
    questions: Question[],
    answers: string[],
    refinement: string
): Promise<string> => {
  const contextFromAnswers = questions.map((q, index) => {
    if (answers[index]?.trim()) {
      return `- Spørsmål: ${q.title}\n- Svar: ${answers[index]}`;
    }
    return null;
  }).filter(Boolean).join('\n\n');

  const fullPrompt = `
    Rolle: Du er en "prompt-veileder", en ekspert i å lage presise og effektive instruksjoner for AI-modeller.
    Oppgave: Transformer den følgende enkle bruker-prompten til en profesjonell prompt.

    Brukerens opprinnelige prompt: "${lazyPrompt}"
    Svar på spørsmål: ${contextFromAnswers || "Ingen svar."}
    Justeringer: ${refinement || "Ingen."}

    Krav:
    1. Overskrifter: **Situasjon**, **Oppgave**, **Mål**, **Kunnskap**.
    2. Under **Kunnskap**, bruk punktliste med fet skrift for nøkkelbegreper.
    3. Avslutt med "Assistenten skal levere:" og en nummerert liste.

    Returner KUN selve prompten i Markdown.
  `;

  try {
    const response = await openrouter.chat.send({
      model: MODEL,
      messages: [{ role: "user", content: fullPrompt }]
    });

    return response.choices[0]?.message?.content?.trim() || "Feil under generering.";
  } catch (error) {
    console.error("OpenRouter Error (Prompt):", error);
    throw new Error("Kunne ikke generere prompt via OpenRouter.");
  }
};
