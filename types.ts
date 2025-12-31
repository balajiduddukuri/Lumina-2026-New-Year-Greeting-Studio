
export enum Audience {
  Professional = 'Professional',
  Personal = 'Personal & Emotional',
  Spiritual = 'Spiritual & Philosophical',
  Creative = 'Creative & Aesthetic'
}

export enum Tone {
  Visionary = 'Inspirational & Visionary',
  Minimalist = 'Minimalist & Elegant',
  Joyful = 'Joyful & Celebratory',
  Reflective = 'Deeply Reflective & Mindful'
}

export enum Theme {
  Light = 'Light',
  Dark = 'Dark',
  Neon = 'Neon'
}

export interface GreetingItem {
  text: string;
  context: string; // e.g. "Poetic Couplet", "Professional Toast"
}

export interface GreetingResponse {
  category: string;
  greetings: GreetingItem[];
}

export interface GeneratorParams {
  audience: Audience;
  tone: Tone;
  themes: string[];
}
