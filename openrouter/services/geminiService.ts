
import { GoogleGenAI } from "@google/genai";
import { Question } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || 'YOUR_API_KEY' });
const model = 'gemini-3-flash-preview';


export const generateClarifyingQuestions = async (lazyPrompt: string): Promise<Question[]> => {
    const questionPrompt = `
        You are an expert prompt engineer. Your task is to analyze a user's 'lazy prompt' and generate exactly 3 insightful clarifying questions that will help refine it into a great prompt.

        Return these questions as a valid JSON array. Each object in the array must have the following keys:
        - "id": a unique number for each question (1, 2, 3).
        - "title": a string, the question itself, in Norwegian.
        - "description": a string, a short one-sentence explanation of why the question is being asked, in Norwegian.
        - "placeholder": a string, giving the user a hint about what to write, in Norwegian (e.g., 'Type your answer here...').
        - "examples": an array of 3 short, helpful string examples for the user to click, in Norwegian.

        Do not include any other text, explanations, or markdown formatting outside of the JSON array itself. The output must be parsable as JSON.

        Here is the user's lazy prompt: "${lazyPrompt}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: questionPrompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (!response || !response.text) {
             throw new Error("Received an empty response from the API when generating questions.");
        }
        
        // Sanitize response by removing markdown backticks if present
        const sanitizedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(sanitizedText);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("API did not return a valid array of questions.");
        }
        
        return questions.map((q: any, index: number) => ({
            id: q.id || index + 1,
            title: q.title || 'Untitled Question',
            description: q.description || 'Please provide more details.',
            placeholder: q.placeholder || 'Your answer here...',
            examples: q.examples || []
        }));

    } catch (error) {
        console.error("Error generating clarifying questions:", error);
         if (error instanceof Error) {
            if(error.message.includes('API key not valid')) {
                throw new Error('API-nøkkelen er ugyldig. Vennligst sjekk konfigurasjonen din.');
            }
            throw new Error(`Kunne ikke generere spørsmål: ${error.message}`);
        }
        throw new Error("En ukjent feil oppstod under generering av spørsmål.");
    }
}


export const generatePrompt = async (
    lazyPrompt: string,
    questions: Question[],
    answers: string[],
    refinement: string
): Promise<string> => {
  const contextFromAnswers = questions.map((q, index) => {
    if (answers[index] && answers[index].trim() !== '') {
      return `- Spørsmål: ${q.title}\n- Svar: ${answers[index]}`;
    }
    return null;
  }).filter(Boolean).join('\n\n');

  const fullPrompt = `
    Rolle: Du er en "prompt-veileder", en ekspert i å lage presise og effektive instruksjoner for AI-modeller.

    Oppgave: Transformer den følgende enkle bruker-prompten, og eventuelle svar, til en detaljert og velstrukturert "profesjonell prompt".

    Brukerens opprinnelige prompt:
    "${lazyPrompt}"

    Brukerens svar på oppfølgingsspørsmål:
    ${contextFromAnswers || "Ingen svar gitt."}

    Eventuelle siste justeringer fra brukeren:
    ${refinement || "Ingen spesifikke justeringer."}


    Krav til den nye prompten:
    1.  **Innhold og Struktur:**
        - Prompten MÅ inneholde følgende hovedseksjoner med fete overskrifter, i denne rekkefølgen: **Situasjon**, **Oppgave**, **Mål**, **Kunnskap**.
        - Under **Kunnskap**, bruk en punktliste (med bindestrek). Hvert punkt bør starte med et nøkkelbegrep i fet skrift, etterfulgt av en kolon (f.eks. "- **E-handel og UX-design:** Beste praksis...").
        - Etter **Kunnskap**-seksjonen, legg til en linje "Assistenten skal levere:" fulgt av en nummerert liste (f.eks. 1. Punkt én) over konkrete leveranser.
    2.  **Formatering:** Bruk kun standard Markdown. Ikke bruk noen annen formatering enn det som er beskrevet over.
    3.  **Klarhet:** Definer oppgaven presist basert på all tilgjengelig informasjon.
    4.  **Tone:** Hold en profesjonell og instruerende tone.

    Viktig: Ikke legg til en introduksjon som "Her er den forbedrede prompten:". Returner KUN selve den ferdige, strukturerte prompten i Markdown-format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
    });
    
    if (response && response.text) {
        return response.text.trim();
    } else {
        throw new Error("Received an empty response from the API.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if(error.message.includes('API key not valid')) {
            throw new Error('API-nøkkelen er ugyldig. Vennligst sjekk konfigurasjonen din.');
        }
        throw new Error(`Kunne ikke generere prompt: ${error.message}`);
    }
    throw new Error("En ukjent feil oppstod under kommunikasjon med Gemini API.");
  }
};