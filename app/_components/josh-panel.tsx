"use client";

import { useState, type FormEvent } from "react";

type CoachMessage = {
  id: number;
  role: "josh" | "learner";
  content: string;
  demo?: boolean;
};

const guidedExamples = [
  {
    prompt: "Explain DNS in simple terms",
    reply:
      "Think of DNS as the internet's contact list. You enter a name such as training.example, and DNS helps your device find the network address for that name. The useful question to ask next is: what record type would point a name to an IPv4 address?",
  },
  {
    prompt: "Give me a hint for the phishing lab",
    reply:
      "Let's investigate rather than jump to the answer. Check three clues: who sent the message, how it pressures you to act, and where the link really leads. Which of those details could you verify through a trusted channel outside the message?",
  },
  {
    prompt: "What's the difference between HTTP 404 and 500?",
    reply:
      "Both are HTTP error responses, but they point to different problems. A 404 says the requested resource wasn't found. A 500 says the server encountered an unexpected problem while handling the request. Try describing which side each one tells you to investigate first.",
  },
  {
    prompt: "Help me practise Linux commands",
    reply:
      "Start with two read-only commands in your own practice environment: pwd shows your current directory, while ls lists entries there. Before running a command, say what you expect it to show. That habit makes troubleshooting safer.",
  },
];

const learningContexts = [
  "General cybersecurity",
  "Linux Fundamentals",
  "Networking Basics",
  "Web Security Essentials",
  "Hands-on lab: Spot the Phishing",
  "Capture the Flag",
];

export default function JoshPanel() {
  const [context, setContext] = useState(learningContexts[0]);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 1,
      role: "josh",
      content:
        "Hi! I'm Josh, your CyberLearn study coach. Ask me to explain a concept, help you think through a lab, or make a short practice plan. I'll guide you step by step rather than simply give away challenge answers.",
    },
  ]);

  function addGuidedExample(example: (typeof guidedExamples)[number]) {
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "learner", content: example.prompt },
      { id: Date.now() + 1, role: "josh", content: example.reply, demo: true },
    ]);
  }

  function sendQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "learner", content: trimmed },
      {
        id: Date.now() + 1,
        role: "josh",
        content:
          "Thanks for asking. The Josh AI service is not connected in this preview yet, so I haven't sent your question to an AI model. You can try one of the guided examples above while we finish the secure backend and usage limits.",
      },
    ]);
    setQuestion("");
  }

  return (
    <section className="assistant-panel">
      <div className="assistant-heading">
        <div>
          <span className="eyebrow">YOUR CYBERLEARN STUDY COACH</span>
          <h1 className="page-title mt-2">
            Ask <span className="gradient-text">Josh.</span>
          </h1>
          <p className="muted mt-2 max-w-2xl">
            Friendly, beginner-first cybersecurity help. Learn the idea, work
            through the clues, and build confidence one question at a time.
          </p>
        </div>
        <span className="status-pill">
          <span className="online-dot" /> Preview mode
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="panel min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-100">Josh's study room</p>
              <p className="muted mt-1 text-xs">A private learning conversation on this page</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <span>Learning context</span>
              <select
                value={context}
                onChange={(event) => setContext(event.target.value)}
                className="max-w-[190px] rounded-md border border-slate-600 bg-slate-900 px-2 py-2 text-xs text-slate-200"
              >
                {learningContexts.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="max-h-[470px] min-h-[300px] space-y-4 overflow-y-auto p-5" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "learner" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl border px-4 py-3 text-sm leading-7 ${
                    message.role === "learner"
                      ? "border-cyan-700/60 bg-cyan-950/50 text-cyan-50"
                      : "border-slate-700 bg-slate-900/80 text-slate-200"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    {message.role === "learner" ? "You" : "Josh"}
                    {message.demo && <span className="rounded bg-cyan-950 px-2 py-0.5 text-cyan-200">Guided example</span>}
                  </div>
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700/60 p-4">
            <form onSubmit={sendQuestion} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="josh-question">Ask Josh a question</label>
              <textarea
                id="josh-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask Josh about a cybersecurity topic..."
                rows={2}
                className="min-h-[54px] flex-1 resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500"
              />
              <button type="submit" className="primary-button justify-center self-stretch sm:self-end">
                Send question →
              </button>
            </form>
            <p className="muted mt-2 text-[10px]">
              Preview only: free-text questions are not sent to an AI service or stored.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <span className="eyebrow">TRY ASKING</span>
            <h2 className="section-title mt-2">Start with a prompt</h2>
            <p className="muted mt-2 text-xs">Choose a guided example to see how Josh teaches.</p>
            <div className="mt-4 grid gap-2">
              {guidedExamples.map((example) => (
                <button
                  key={example.prompt}
                  type="button"
                  onClick={() => addGuidedExample(example)}
                  className="answer-option text-left"
                >
                  <span className="text-cyan-300">✦</span>
                  <span>{example.prompt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <span className="eyebrow">HOW JOSH HELPS</span>
            <ul className="mt-3 space-y-3 text-xs leading-6 text-slate-300">
              <li><b className="text-cyan-300">Explain</b><br />Break down difficult ideas in plain language.</li>
              <li><b className="text-cyan-300">Guide</b><br />Offer clues and questions instead of lab spoilers.</li>
              <li><b className="text-cyan-300">Practise</b><br />Create examples and short revision exercises.</li>
              <li><b className="text-cyan-300">Encourage</b><br />Help learners choose a sensible next step.</li>
            </ul>
          </div>

          <div className="panel p-5">
            <span className="eyebrow">MEMBERSHIP IDEAS</span>
            <h2 className="section-title mt-2">Keep learning free</h2>
            <p className="muted mt-2 text-xs">Draft pricing only — checkout and subscriptions are not enabled.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-slate-700 p-3">
                <div className="flex items-center justify-between gap-2"><b className="text-sm">Free</b><b className="text-sm text-cyan-300">$0</b></div>
                <p className="muted mt-1 text-xs">Core courses, essential labs and a small Josh allowance.</p>
              </div>
              <div className="rounded-lg border border-cyan-700/50 bg-cyan-950/20 p-3">
                <div className="flex items-center justify-between gap-2"><b className="text-sm">Plus</b><b className="text-sm text-cyan-300">$5.99/mo</b></div>
                <p className="muted mt-1 text-xs">More coaching, personal explanations and study plans.</p>
              </div>
              <div className="rounded-lg border border-slate-700 p-3">
                <div className="flex items-center justify-between gap-2"><b className="text-sm">Pro</b><b className="text-sm text-cyan-300">$9.99/mo</b></div>
                <p className="muted mt-1 text-xs">Higher usage allowance and advanced practice support.</p>
              </div>
            </div>
            <p className="muted mt-3 text-[10px]">Prices are proposals to review against real AI costs before launch.</p>
          </div>
        </aside>
      </div>

      <div className="resource-banner mt-5">
        <div>
          <span className="eyebrow">LEARN WITHOUT SPOILERS</span>
          <h2 className="section-title mt-2">Josh helps you discover the answer.</h2>
          <p className="muted mt-2 text-xs">The live AI connection, account usage limits and billing will be added in a later, separately reviewed step.</p>
        </div>
        <span className="status-pill">No live AI calls · No charges</span>
      </div>
    </section>
  );
}
