"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { builderData, quizQuestions, simpleModals } from "@/data/modal-verbs";

type BuilderVerb = (typeof builderData.verbs)[number];
type FilterPurpose = "all" | "Ability" | "Permission" | "Advice" | "Rule / Must" | "Possibility";
type ConfettiPiece = {
  left: number;
  top: number;
  drift: number;
  rotation: number;
  delay: number;
  color: string;
};

const purposes: { label: string; value: FilterPurpose }[] = [
  { label: "All", value: "all" },
  { label: "Ability", value: "Ability" },
  { label: "Permission", value: "Permission" },
  { label: "Advice", value: "Advice" },
  { label: "Rules", value: "Rule / Must" },
  { label: "Possibility", value: "Possibility" },
];

const activePillClass =
  "purpose-pill px-3 py-1.5 rounded-full font-bold bg-sky-600 text-white whitespace-nowrap shadow-sm";
const inactivePillClass =
  "purpose-pill px-3 py-1.5 rounded-full font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap";

const learningSteps = [
  { title: "Golden Rules", icon: "fa-star" },
  { title: "Sentence Builder", icon: "fa-cubes" },
  { title: "Modal Directory", icon: "fa-book-open" },
  { title: "Quick Quiz", icon: "fa-gamepad" },
];
const confettiColors = ["#0ea5e9", "#6366f1", "#a855f7", "#f43f5e", "#f59e0b", "#10b981"];

function shuffleOptions(options: string[], correct: string, seed: number) {
  const shuffled = [...options];
  let state = seed | 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  if (shuffled[0].toLowerCase() === correct.toLowerCase()) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

function HighlightedExample({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{[^}]+\})/g).map((part, index) =>
        part.startsWith("{") && part.endsWith("}") ? (
          <span className="modal-tag" key={index}>
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterPurpose>("all");
  const [subject, setSubject] = useState("She");
  const [modal, setModal] = useState("can");
  const [verb, setVerb] = useState<BuilderVerb>(builderData.verbs[0]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizRound, setQuizRound] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [toast, setToast] = useState("");
  const voiceNoticeShown = useRef(false);

  useEffect(() => {
    if (!quizFinished || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setConfettiPieces([]);
      return;
    }

    setConfettiPieces(
      Array.from({ length: 90 }, () => ({
        left: 35 + Math.random() * 30,
        top: 20 + Math.random() * 20,
        drift: (Math.random() - 0.5) * 400,
        rotation: 360 + Math.random() * 1080,
        delay: Math.random() * 250,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      })),
    );
    const timeout = window.setTimeout(() => setConfettiPieces([]), 3500);
    return () => window.clearTimeout(timeout);
  }, [quizFinished]);

  const question = quizQuestions[quizIndex];
  const shuffledOptions = useMemo(
    () => shuffleOptions(question.options, question.correct, (quizRound + 1) * 1009 + quizIndex * 9176),
    [question.options, quizIndex, quizRound],
  );
  const sentence = `${subject} ${modal} ${verb.verb} ${verb.end}.`;
  const filteredModals = useMemo(
    () =>
      simpleModals.filter(
        (item) =>
          activeFilter === "all" ||
          item.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
          item.meaning.toLowerCase().includes(activeFilter.toLowerCase()),
      ),
    [activeFilter],
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const shouldUseDark =
      savedTheme === "dark" ||
      (savedTheme === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }

  function speakText(text: string) {
    if (!("speechSynthesis" in window)) {
      notify("Audio not supported in this browser");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[{}]/g, ""));
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices
      .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
      .sort((first, second) => {
        const naturalVoice = /natural|neural|online|enhanced|premium|aria|jenny|ava|andrew|samantha|google/i;
        return Number(naturalVoice.test(second.name)) - Number(naturalVoice.test(first.name));
      });
    if (englishVoices[0]) {
      utterance.voice = englishVoices[0];
    } else if (!voiceNoticeShown.current) {
      voiceNoticeShown.current = true;
      notify("No English voice installed. Using the device's default voice.");
    }
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  async function copySentence(text: string) {
    try {
      await navigator.clipboard.writeText(text.replace(/[{}]/g, ""));
      notify(`Copied: "${text.replace(/[{}]/g, "")}"`);
    } catch {
      const input = document.createElement("textarea");
      input.value = text.replace(/[{}]/g, "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand("copy");
      input.remove();
      notify(copied ? `Copied: "${text.replace(/[{}]/g, "")}"` : "Unable to copy sentence");
    }
  }

  function toggleTheme() {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    document.documentElement.classList.toggle("dark", nextDarkMode);
    localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
  }

  function randomizeSentence() {
    setSubject(builderData.subjects[Math.floor(Math.random() * builderData.subjects.length)]);
    setModal(builderData.modals[Math.floor(Math.random() * builderData.modals.length)]);
    setVerb(builderData.verbs[Math.floor(Math.random() * builderData.verbs.length)]);
  }

  function selectModal(modalName: string) {
    const found = builderData.modals.find(
      (item) => item.toLowerCase() === modalName.toLowerCase(),
    );
    if (!found) return;
    setModal(found);
    notify(`Loaded "${modalName}" into Sentence Builder!`);
    document.getElementById("sandbox")?.scrollIntoView({ behavior: "smooth" });
  }

  function goToStep(step: number) {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextQuestion() {
    if (answer === null || quizFinished) return;
    if (quizIndex === quizQuestions.length - 1) {
      setQuizFinished(true);
      return;
    }
    setQuizIndex((current) => current + 1);
    setAnswer(null);
  }

  function restartQuiz() {
    setQuizIndex(0);
    setScore(0);
    setAnswer(null);
    setQuizFinished(false);
    setQuizRound((current) => current + 1);
  }

  function answerQuestion(selected: string) {
    if (answer !== null || quizFinished) return;
    setAnswer(selected);
    const correct = selected.toLowerCase() === question.correct.toLowerCase();
    if (correct) {
      setScore((current) => current + 1);
      speakText(question.sentence.replace("___", question.correct));
    }
  }

  const isCorrectAnswer = answer?.toLowerCase() === question.correct.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {confettiPieces.length > 0 && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {confettiPieces.map((piece, index) => {
            const style: CSSProperties & { "--confetti-drift": string; "--confetti-rotation": string } = {
              left: `${piece.left}%`,
              top: `${piece.top}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}ms`,
              "--confetti-drift": `${piece.drift}px`,
              "--confetti-rotation": `${piece.rotation}deg`,
            };
            return <span key={index} className="quiz-confetti" style={style} />;
          })}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25">
              <i className="fa-solid fa-bolt text-lg" />
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                Simple Modal Verbs
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Easy &amp; Interactive
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rules made simple with audio &amp; interactive games
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="hidden items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 dark:bg-slate-800 dark:text-sky-300 sm:inline-flex"
            >
              <i className="fa-solid fa-cubes text-xs" /> Sentence Builder
            </button>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="hidden items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:bg-slate-800 dark:text-amber-300 sm:inline-flex"
            >
              <i className="fa-solid fa-gamepad text-xs" /> Quick Quiz
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Toggle Mode"
              aria-label="Toggle dark mode"
            >
              <i className={`fa-solid ${darkMode ? "fa-sun text-amber-400" : "fa-moon"}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <nav
          aria-label="Learning progress"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Step {currentStep + 1} of {learningSteps.length}: {learningSteps[currentStep].title}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {Math.round(((currentStep + 1) / learningSteps.length) * 100)}% complete
            </span>
          </div>
          <div
            className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={learningSteps.length}
            aria-valuenow={currentStep + 1}
            aria-label="Learning progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / learningSteps.length) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {learningSteps.map((step, index) => (
              <button
                type="button"
                key={step.title}
                onClick={() => goToStep(index)}
                aria-current={currentStep === index ? "step" : undefined}
                className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition sm:justify-start sm:px-3 ${
                  currentStep === index
                    ? "bg-sky-600 text-white"
                    : index < currentStep
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                <i className={`fa-solid ${step.icon}`} />
                <span className="hidden truncate sm:inline">{step.title}</span>
                <span className="sm:hidden">{index + 1}</span>
              </button>
            ))}
          </div>
        </nav>

        {currentStep === 0 && <section className="animate-[step-appear_250ms_ease-out] relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 p-5 text-white shadow-lg sm:p-6">
          <div className="relative z-10">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-200">
              <i className="fa-solid fa-star" /> Remember These 3 Easy Rules
            </div>
            <h2 className="mb-4 text-xl font-extrabold tracking-tight sm:text-2xl">
              Modal verbs are super easy because they never change!
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <RuleCard icon="fa-ban" title='1. No "S" for He/She/It'>
                <p className="text-xs text-white/90">
                  Never add <span className="rounded bg-white/20 px-1 font-mono">-s</span> or{" "}
                  <span className="rounded bg-white/20 px-1 font-mono">-ed</span>.
                </p>
                <div className="mt-2 rounded-lg bg-black/20 p-2 font-mono text-xs">
                  <span className="text-emerald-300">✓ She can play</span>
                  <br />
                  <span className="text-rose-300 line-through">✗ She cans play</span>
                </div>
              </RuleCard>
              <RuleCard icon="fa-xmark" title='2. Never Say "to"'>
                <p className="text-xs text-white/90">Use the base verb directly right after the modal.</p>
                <div className="mt-2 rounded-lg bg-black/20 p-2 font-mono text-xs">
                  <span className="text-emerald-300">✓ I must sleep</span>
                  <br />
                  <span className="text-rose-300 line-through">✗ I must to sleep</span>
                </div>
              </RuleCard>
              <RuleCard icon="fa-question" title="3. Easy Questions">
                <p className="text-xs text-white/90">
                  Just put the modal verb in the front to ask a question!
                </p>
                <div className="mt-2 rounded-lg bg-black/20 p-2 font-mono text-xs">
                  <span className="text-emerald-300">✓ Can you help?</span>
                  <br />
                  <span className="text-rose-300 line-through">✗ Do you can help?</span>
                </div>
              </RuleCard>
            </div>
          </div>
        </section>}

        {currentStep === 1 && <section
          id="sandbox"
          className="animate-[step-appear_250ms_ease-out] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                <i className="fa-solid fa-cubes" /> Interactive Sandbox
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Make Your Sentence!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click words to build a sentence and test the grammar rule live:
              </p>
            </div>
            <button
              type="button"
              onClick={randomizeSentence}
              className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 sm:self-auto"
            >
              <i className="fa-solid fa-shuffle text-sky-500" /> Randomize
            </button>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <BuilderGroup title="1. Who? (Subject)">
              {builderData.subjects.map((item) => (
                <ChoiceButton key={item} selected={subject === item} onClick={() => setSubject(item)}>
                  {item}
                </ChoiceButton>
              ))}
            </BuilderGroup>
            <BuilderGroup title="2. Modal Verb" tone="sky">
              {builderData.modals.map((item) => (
                <ChoiceButton
                  key={item}
                  selected={modal === item}
                  tone="indigo"
                  onClick={() => setModal(item)}
                >
                  {item}
                </ChoiceButton>
              ))}
            </BuilderGroup>
            <BuilderGroup title="3. Action (Base Verb)">
              {builderData.verbs.map((item) => (
                <ChoiceButton
                  key={item.verb}
                  selected={verb.verb === item.verb}
                  onClick={() => setVerb(item)}
                >
                  {item.verb}
                </ChoiceButton>
              ))}
            </BuilderGroup>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white sm:flex-row sm:p-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => speakText(sentence)}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500 text-lg text-white shadow-md transition hover:bg-sky-400 active:scale-95"
                title="Listen to sentence"
                aria-label="Listen to sentence"
              >
                <i className="fa-solid fa-volume-high" />
              </button>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                  Your Sentence:
                </div>
                <div className="font-mono-code text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  {sentence}
                </div>
                <div className="mt-0.5 text-xs font-medium text-emerald-300">
                  Notice: Even with &quot;{subject}&quot;, we say &quot;{modal} {verb.verb}&quot;, never
                  &quot;{modal}s&quot; or &quot;{modal} to {verb.verb}&quot;!
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void copySentence(sentence)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <i className="fa-regular fa-copy" /> Copy Sentence
            </button>
          </div>
        </section>}

        {currentStep === 2 && <section className="animate-[step-appear_250ms_ease-out] space-y-4">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <span>Modal Verbs Directory</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  (Click any card to explore)
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Short rules and easy everyday example sentences
              </p>
            </div>
            <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {purposes.map((purpose) => (
                <button
                  type="button"
                  key={purpose.value}
                  onClick={() => setActiveFilter(purpose.value)}
                  className={activeFilter === purpose.value ? activePillClass : inactivePillClass}
                >
                  {purpose.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {simpleModals.map((item) => (
              <button
                type="button"
                key={item.modal}
                onClick={() => selectModal(item.modal)}
                className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-700 shadow-sm transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-400"
              >
                {item.modal}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                    <th className="w-28 px-4 py-3">Modal</th>
                    <th className="w-44 px-4 py-3">Simple Meaning</th>
                    <th className="w-48 px-4 py-3">How to use (Formula)</th>
                    <th className="px-4 py-3">Simple Example Sentences</th>
                    <th className="w-20 px-4 py-3 text-center">Audio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                  {filteredModals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No matching modal found. Click &quot;All&quot; to view everything.
                      </td>
                    </tr>
                  ) : (
                    filteredModals.map((item) => (
                      <tr
                        key={item.modal}
                        className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="align-top px-4 py-3">
                          <span className="inline-block rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1 font-mono text-base font-bold text-sky-600 dark:border-sky-800 dark:bg-sky-950/80 dark:text-sky-400">
                            {item.modal}
                          </span>
                        </td>
                        <td className="align-top px-4 py-3">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {item.meaning}
                          </div>
                          <div className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400">
                            Tip: {item.tip}
                          </div>
                        </td>
                        <td className="align-top px-4 py-3">
                          <div className="inline-block rounded-lg border border-slate-200 bg-slate-100 p-1.5 font-mono text-[11px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.formula}
                          </div>
                          <div className="mt-1 text-[10px] font-semibold text-rose-500">
                            Neg: {item.negative}
                          </div>
                        </td>
                        <td className="align-top px-4 py-3">
                          <div className="space-y-1.5">
                            {item.examples.map((example) => (
                              <div
                                key={example}
                                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800/60"
                              >
                                <span className="text-slate-700 dark:text-slate-200">
                                  <HighlightedExample text={example} />
                                </span>
                                <button
                                  type="button"
                                  onClick={() => speakText(example)}
                                  className="p-1 text-slate-400 transition hover:text-sky-600 dark:hover:text-sky-400"
                                  title="Listen"
                                  aria-label={`Listen: ${example.replace(/[{}]/g, "")}`}
                                >
                                  <i className="fa-solid fa-volume-high text-xs" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="align-top px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => speakText(item.examples[0])}
                            className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 transition hover:bg-sky-200 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
                            title="Play first example"
                            aria-label={`Play first example for ${item.modal}`}
                          >
                            <i className="fa-solid fa-play text-xs" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>}

        {currentStep === 3 && <section
          id="quiz"
          className="animate-[step-appear_250ms_ease-out] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                <i className="fa-solid fa-trophy" /> Practice Game
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fill in the Blank Quiz</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick the best modal verb for each simple situation!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase text-slate-400">Score</div>
                <div className="font-mono text-base font-bold text-slate-800 dark:text-slate-100">
                  <span>{score}</span> / <span>{quizQuestions.length}</span>
                </div>
              </div>
              {!quizFinished && (
                <button
                  type="button"
                  onClick={nextQuestion}
                  disabled={answer === null}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{quizIndex === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}</span>
                  <i
                    className={`fa-solid ${
                      quizIndex === quizQuestions.length - 1 ? "fa-flag-checkered" : "fa-arrow-right"
                    } text-xs`}
                  />
                </button>
              )}
            </div>
          </div>
          {quizFinished ? (
            <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
              <i className="fa-solid fa-trophy text-3xl text-amber-500" />
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Quiz complete!</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You scored <strong>{score} out of {quizQuestions.length}</strong>.
              </p>
              <button
                type="button"
                onClick={restartQuiz}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Play Again
              </button>
            </div>
          ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
                Question {quizIndex + 1} of {quizQuestions.length} · Situation: {question.context}
              </div>
              <div className="my-3 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                {question.sentence}
              </div>
              <div className="text-xs italic text-slate-500 dark:text-slate-400">
                Pick the most accurate modal:
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {shuffledOptions.map((option) => {
                const isThisCorrect =
                  answer !== null && option.toLowerCase() === question.correct.toLowerCase();
                const isWrongChoice =
                  answer !== null &&
                  option.toLowerCase() === answer.toLowerCase() &&
                  !isCorrectAnswer;
                const style = isThisCorrect
                  ? "border-2 border-emerald-500 bg-emerald-500 text-white"
                  : isWrongChoice
                    ? "border-2 border-rose-500 bg-rose-500 text-white"
                    : `border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${
                        answer === null
                          ? "hover:bg-sky-50 dark:hover:bg-slate-700"
                          : "opacity-40"
                      }`;
                return (
                  <button
                    type="button"
                    key={option}
                    disabled={answer !== null}
                    onClick={() => answerQuestion(option)}
                    className={`rounded-xl px-4 py-3 font-mono text-sm font-bold transition active:scale-95 ${style}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {answer !== null && (
              <div
                className={`rounded-2xl border p-3.5 text-center text-xs font-semibold ${
                  isCorrectAnswer
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
                }`}
                role="status"
              >
                {isCorrectAnswer ? (
                  <>
                    <i className="fa-solid fa-circle-check mr-1.5 text-emerald-600" /> Correct!{" "}
                    {question.explanation}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-circle-xmark mr-1.5 text-rose-600" /> Oops! The answer is{" "}
                    <strong>{question.correct}</strong>. {question.explanation}
                  </>
                )}
              </div>
            )}
          </div>
          )}
        </section>}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <i className="fa-solid fa-arrow-left mr-2" />
            Previous
          </button>
          {currentStep < learningSteps.length - 1 ? (
            <button
              type="button"
              onClick={() => goToStep(currentStep + 1)}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700"
            >
              Continue
              <i className="fa-solid fa-arrow-right ml-2" />
            </button>
          ) : (
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <i className="fa-solid fa-circle-check mr-2" />
              Course complete
            </span>
          )}
        </div>
      </main>

      <div
        className={`pointer-events-none fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl transition-all duration-300 dark:bg-white dark:text-slate-900 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        <i className="fa-solid fa-circle-check text-emerald-400 dark:text-emerald-600" />
        <span>{toast || "Copied!"}</span>
      </div>
    </div>
  );
}

function RuleCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold text-yellow-300">
        <i className={`fa-solid ${icon}`} /> {title}
      </div>
      {children}
    </div>
  );
}

function BuilderGroup({
  title,
  tone = "slate",
  children,
}: {
  title: string;
  tone?: "slate" | "sky";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        tone === "sky"
          ? "border-sky-100 bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/20"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"
      }`}
    >
      <div
        className={`mb-2 text-xs font-bold uppercase ${
          tone === "sky" ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function ChoiceButton({
  selected,
  tone = "sky",
  onClick,
  children,
}: {
  selected: boolean;
  tone?: "sky" | "indigo";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const selectedClass =
    tone === "indigo"
      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
      : "border-sky-600 bg-sky-600 text-white shadow-sm";
  const idleClass =
    tone === "indigo"
      ? "border-slate-200 bg-white text-indigo-600 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
        tone === "indigo" ? "font-mono" : ""
      } ${selected ? selectedClass : idleClass}`}
    >
      {children}
    </button>
  );
}
