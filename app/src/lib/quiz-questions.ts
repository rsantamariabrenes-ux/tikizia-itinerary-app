export type QuestionType = 'multi-select' | 'single-select' | 'date' | 'scale' | 'yes-no';

export type QuizOption = {
  value: string;
  label: string;
  emoji: string;
};

export type QuizQuestion = {
  id: string;
  step: number;
  question: string;
  subtext?: string;
  type: QuestionType;
  options?: QuizOption[];
  scaleLabels?: [string, string, string, string];
  required: boolean;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'destinations',
    step: 1,
    question: 'Which regions of Costa Rica are on your list?',
    subtext: 'Select all that apply',
    type: 'multi-select',
    required: true,
    options: [
      { value: 'La Fortuna / Arenal', label: 'La Fortuna / Arenal', emoji: '🌋' },
      { value: 'Manuel Antonio', label: 'Manuel Antonio', emoji: '🏖️' },
      { value: 'Monteverde', label: 'Monteverde', emoji: '☁️' },
      { value: 'Chirripó / San Gerardo', label: 'Chirripó / San Gerardo', emoji: '⛰️' },
      { value: 'Guanacaste', label: 'Guanacaste', emoji: '🌞' },
      { value: 'Osa / Corcovado', label: 'Osa / Corcovado', emoji: '🦜' },
      { value: 'Tortuguero', label: 'Tortuguero', emoji: '🐢' },
      { value: 'Not sure yet', label: 'Not sure yet', emoji: '🗺️' },
    ],
  },
  {
    id: 'startDate',
    step: 2,
    question: 'When does your trip start?',
    type: 'date',
    required: true,
  },
  {
    id: 'duration',
    step: 3,
    question: 'How long is your trip?',
    type: 'single-select',
    required: true,
    options: [
      { value: '3-4 days', label: '3–4 days', emoji: '⚡' },
      { value: '5-7 days', label: '5–7 days', emoji: '🌿' },
      { value: '8-10 days', label: '8–10 days', emoji: '🦋' },
      { value: '11-14 days', label: '11–14 days', emoji: '🌎' },
      { value: '15+ days', label: '15+ days', emoji: '🏕️' },
    ],
  },
  {
    id: 'travelers',
    step: 4,
    question: "Who's traveling with you?",
    type: 'single-select',
    required: true,
    options: [
      { value: 'Solo traveler', label: 'Solo traveler', emoji: '🧍' },
      { value: 'Couple', label: 'Couple', emoji: '💑' },
      { value: 'Family with kids', label: 'Family with kids', emoji: '👨‍👩‍👧' },
      { value: 'Group of friends', label: 'Group of friends', emoji: '👫' },
    ],
  },
  {
    id: 'tripGoal',
    step: 5,
    question: "What's the feeling you're chasing?",
    type: 'single-select',
    required: true,
    options: [
      { value: 'Adventure & Thrills', label: 'Adventure & Thrills', emoji: '🤿' },
      { value: 'Pure Nature & Wildlife', label: 'Pure Nature & Wildlife', emoji: '🦥' },
      { value: 'Rest & Recharge', label: 'Rest & Recharge', emoji: '🧘' },
      { value: 'Culture & Local Life', label: 'Culture & Local Life', emoji: '🌮' },
    ],
  },
  {
    id: 'activities',
    step: 6,
    question: 'Which activities excite you most?',
    subtext: 'Select all that apply',
    type: 'multi-select',
    required: true,
    options: [
      { value: 'Hiking', label: 'Hiking', emoji: '🥾' },
      { value: 'Waterfalls', label: 'Waterfalls', emoji: '💧' },
      { value: 'Wildlife watching', label: 'Wildlife watching', emoji: '🐊' },
      { value: 'Zipline', label: 'Zipline', emoji: '🧗' },
      { value: 'White water rafting', label: 'Rafting', emoji: '🚣' },
      { value: 'Local food & cooking', label: 'Local food', emoji: '🍽️' },
      { value: 'Hot springs', label: 'Hot springs', emoji: '♨️' },
      { value: 'Birdwatching', label: 'Birdwatching', emoji: '🦜' },
      { value: 'Beach & swimming', label: 'Beach & swimming', emoji: '🏊' },
      { value: 'ATV & off-road', label: 'ATV & off-road', emoji: '🏍️' },
    ],
  },
  {
    id: 'travelStyle',
    step: 7,
    question: "What's your travel style?",
    type: 'single-select',
    required: true,
    options: [
      { value: 'Budget explorer', label: 'Budget explorer', emoji: '🎒' },
      { value: 'Comfortable traveler', label: 'Comfortable traveler', emoji: '🛎️' },
      { value: 'Luxury seeker', label: 'Luxury seeker', emoji: '✨' },
    ],
  },
  {
    id: 'adventureLevel',
    step: 8,
    question: 'How adventurous are you?',
    type: 'scale',
    required: true,
    scaleLabels: ['Easy-going', 'Moderate', 'Adventurous', 'Extreme'],
  },
  {
    id: 'hikingInterest',
    step: 9,
    question: 'How much do you love hiking?',
    type: 'scale',
    required: true,
    scaleLabels: ['Not really', 'Casual strolls', 'Long trails', 'I live for it'],
  },
  {
    id: 'hasKids',
    step: 10,
    question: 'Will kids be joining?',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'transport',
    step: 11,
    question: 'How are you getting around?',
    type: 'single-select',
    required: true,
    options: [
      { value: 'Rental car', label: 'Rental car', emoji: '🚗' },
      { value: 'Shuttle service', label: 'Shuttle service', emoji: '🚐' },
      { value: 'Public transport', label: 'Public transport', emoji: '🚌' },
      { value: 'Not sure yet', label: 'Not sure yet', emoji: '🤔' },
    ],
  },
  {
    id: 'budget',
    step: 12,
    question: "What's your budget per person?",
    subtext: 'Excluding flights',
    type: 'single-select',
    required: true,
    options: [
      { value: 'Under $1,000', label: 'Under $1,000', emoji: '💵' },
      { value: '$1,000–$2,000', label: '$1,000–$2,000', emoji: '💵💵' },
      { value: '$2,000–$3,500', label: '$2,000–$3,500', emoji: '💵💵💵' },
      { value: '$3,500+', label: '$3,500+', emoji: '💎' },
    ],
  },
];
