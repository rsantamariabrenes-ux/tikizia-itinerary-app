export type QuizAnswers = {
  destinations: string[];
  startDate: string;
  duration: string;
  travelers: string;
  tripGoal: string;
  activities: string[];
  travelStyle: string;
  adventureLevel: number;   // 1 = Easy-going, 2 = Moderate, 3 = Adventurous, 4 = Extreme
  hikingInterest: number;   // 1 = Not really, 2 = Casual, 3 = Long trails, 4 = Expert
  hasKids: boolean;
  kidsAges: string;
  transport: string;
  budget: string;
  hasAccommodation: boolean;
  extraContext: string;
};

export type SessionData = {
  token: string;
  generationsRemaining: number;
};

export type GenerateResponse = {
  html: string;
  generationsRemaining: number;
};

export type AccessTokenValidation = {
  valid: boolean;
  generationsRemaining: number;
  email: string;
};
