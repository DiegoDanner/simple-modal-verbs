export type ModalEntry = {
  modal: string;
  category: string;
  meaning: string;
  formula: string;
  negative: string;
  examples: string[];
  tip: string;
};

export const simpleModals: ModalEntry[] = [
  {
    modal: "Can",
    category: "Ability",
    meaning: "Able to do something (Ability) or asking for permission",
    formula: "Subject + can + base verb",
    negative: "cannot / can't",
    examples: [
      "I {can} swim very well.",
      "She {can} speak English.",
      "{Can} I use your pen, please?",
    ],
    tip: "Never use 'cans'. Even with he/she: 'He can swim'.",
  },
  {
    modal: "Could",
    category: "Ability",
    meaning: "Past ability (was able to) or polite request",
    formula: "Subject + could + base verb",
    negative: "could not / couldn't",
    examples: [
      "When I was six, I {could} ride a bike.",
      "{Could} you open the door, please?",
    ],
    tip: "'Could' is softer and more polite than 'Can'.",
  },
  {
    modal: "Must",
    category: "Rule / Must",
    meaning: "100% necessary, important rule, or law",
    formula: "Subject + must + base verb",
    negative: "must not / mustn't (forbidden)",
    examples: [
      "You {must} stop at red lights.",
      "You {must} wash your hands before eating.",
      "You {must not} touch this wire.",
    ],
    tip: "'Must not' means it is forbidden/illegal.",
  },
  {
    modal: "Should",
    category: "Advice",
    meaning: "Good idea or friendly advice",
    formula: "Subject + should + base verb",
    negative: "should not / shouldn't",
    examples: [
      "You look tired, you {should} sleep early.",
      "We {should} eat more fresh fruits.",
      "You {shouldn't} eat too much sugar.",
    ],
    tip: "Use 'should' to give friendly tips and suggestions.",
  },
  {
    modal: "May",
    category: "Permission",
    meaning: "Polite permission or 50% maybe",
    formula: "Subject + may + base verb",
    negative: "may not",
    examples: ["{May} I come in, teacher?", "It {may} rain this afternoon."],
    tip: "'May I' is very polite and respectful.",
  },
  {
    modal: "Might",
    category: "Possibility",
    meaning: "Small possibility (maybe 30%)",
    formula: "Subject + might + base verb",
    negative: "might not",
    examples: [
      "I {might} go to the party, but I am not sure.",
      "Take an umbrella, it {might} rain.",
    ],
    tip: "Means 'maybe yes, maybe no'.",
  },
  {
    modal: "Will",
    category: "Future",
    meaning: "Future action or spontaneous promise",
    formula: "Subject + will + base verb",
    negative: "will not / won't",
    examples: [
      "I {will} call you tomorrow.",
      "The train {will} arrive at 9:00 AM.",
      "I {won't} forget your birthday.",
    ],
    tip: "Short form: I will = I'll, Will not = Won't.",
  },
  {
    modal: "Would",
    category: "Polite Request",
    meaning: "Polite request, 'would like' (want), or imagining",
    formula: "Subject + would + base verb",
    negative: "would not / wouldn't",
    examples: [
      "I {would} like a glass of water, please.",
      "{Would} you like some coffee?",
      "If I had wings, I {would} fly.",
    ],
    tip: "'Would like' is the polite way to say 'want'.",
  },
];

export const builderData = {
  subjects: ["I", "You", "He", "She", "We", "They"],
  modals: ["can", "could", "must", "should", "may", "will", "would"],
  verbs: [
    { verb: "swim", end: "in the pool" },
    { verb: "read", end: "a book" },
    { verb: "eat", end: "an apple" },
    { verb: "drink", end: "water" },
    { verb: "play", end: "the guitar" },
    { verb: "sleep", end: "for 8 hours" },
  ],
};

export type QuizQuestion = {
  context: string;
  sentence: string;
  correct: string;
  options: string[];
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    context: "Advice & Health",
    sentence: "You have a high fever. You ___ see a doctor.",
    correct: "should",
    options: ["should", "could", "might", "would"],
    explanation: "Giving good advice for health uses 'should'.",
  },
  {
    context: "Traffic Law & Rule",
    sentence: "Drivers ___ wear their seatbelt in the car.",
    correct: "must",
    options: ["must", "might", "could", "may"],
    explanation: "It is an official law and necessity, so we use 'must'.",
  },
  {
    context: "Natural Ability",
    sentence: "Penguins are birds, but they ___ fly.",
    correct: "cannot",
    options: ["cannot", "must not", "should not", "won't"],
    explanation: "'Cannot' describes a physical lack of ability.",
  },
  {
    context: "Polite Classroom Question",
    sentence: "Teacher, ___ I drink some water, please?",
    correct: "May",
    options: ["May", "Must", "Should", "Will"],
    explanation: "'May I...' is the most polite way to ask a teacher for permission.",
  },
  {
    context: "Polite Ordering in a Cafe",
    sentence: "I ___ like an orange juice, please.",
    correct: "would",
    options: ["would", "can", "must", "shall"],
    explanation: "'Would like' is the polite way of saying 'I want'.",
  },
  {
    context: "Past Ability",
    sentence: "When Leo was five years old, he ___ already read books.",
    correct: "could",
    options: ["could", "can", "must", "should"],
    explanation: "'Could' expresses ability in the past.",
  },
  {
    context: "Uncertain Weather",
    sentence: "There are few clouds. It ___ rain, but I doubt it.",
    correct: "might",
    options: ["might", "must", "can", "should"],
    explanation: "'Might' expresses a small, uncertain chance.",
  },
];
