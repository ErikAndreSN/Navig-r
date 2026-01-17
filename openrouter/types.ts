
export interface Question {
  id: number;
  title: string;
  description: string;
  placeholder: string;
  examples: string[];
}

export interface PromptHistoryItem {
  id: number;
  lazyPrompt: string;
  greatPrompt: string;
}

export interface FeedbackData {
    text: string;
    sentiment: number | null;
}
