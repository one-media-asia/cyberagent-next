"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://api.onemedia.asia").replace(/\\/$/, "");
const CHECKOUT_URL = "https://checkout.revolut.com/pay/325622b3-0dd7-4f24-804f-98b9e59aa1fa";
const STORAGE_KEY = "cyberlearn_josh_trial_v1";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function JoshPage() {
  const [token, setToken] = useState("");
  const [remaining, setRemaining] = useState<number | null>(3);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hey! I'm Josh, your CyberLearn tutor. Ask me anything about Linux, networking, or cybersecurity. I'll explain it step by step." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function initialise() {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.token && typeof parsed.remaining === "number") {
            if (active) {
              setToken(parsed.token);
              setRemaining(parsed.remaining);
              setStarting(false);
            }
            return;
          }
        }
        const response = await fetch(`${API_BASE}/api/cyberagent/trial/start/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await response.json();
        if (!response.ok || !data.token) throw new Error(data.error || data.detail || "Josh couldn't start a trial session.");
        if (!active) return;
        const prompts = typeof data.prompts_remaining === "number" ? data.prompts_remaining : 3;
        setToken(data.token);
        setRemaining(prompts);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token, remaining: prompts }));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Could not connect to Josh.");
      } finally {
        if (active) setStarting(false);
      }
    }
    initialise();
    return () => { active = false; };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || !token || loading || remaining === 0) return;
    setInput("");
    setError("");
    setMessages((old) => [...old, { role: "user", content: message }]);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cyberagent/josh/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || data.message || "Josh couldn't answer that. Please try again.");
      setMessages((old) => [...old, { role: "assistant", content: data.reply || "I couldn't create a reply just now. Please try again." }]);
      const nextRemaining = typeof data.prompts_remaining === "number" ? data.prompts_remaining : data.prompts_remaining === null ? null : remaining;
      setRemaining(nextRemaining);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, remaining: nextRemaining }));
    } catch (err) {
      setMessages((old) => old.filter((item, index) => !(item.role === "user" && index === old.length - 1)));
      setInput(message);
      setError(err instanceof Error ? err.message : "Connection problem. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const trialFinished = remaining === 0;

  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-6 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300">← Back to CyberLearn</Link>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">CyberLearn AI tutor</span>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-900/70 shadow-2xl">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Your learning companion</p>
                <h1 className="mt-1 text-3xl font-bold">Josh<span className="text-cyan-400"> AI.</span></h1>
              </div>
              <div className="text-right text-xs text-slate-400">
                <div className="flex items-center justify-end gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Qwen-powered tutor</div>
                <p className="mt-1">{remaining === null ? "Premium access" : `${remaining ?? 3} free prompts remaining`}</p>
              </div>
            </header>

            <div className="flex h-[58vh] min-h-[390px] flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-7">
              {messages.map((item, index) => (
                <div key={index} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[78%] ${item.role === "user" ? "ml-auto bg-cyan-400 text-slate-950" : "border border-slate-700 bg-[#080d18] text-slate-200"}`}>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest opacity-60">{item.role === "user" ? "You" : "Josh"}</p>
                  <p className="whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
              {loading && <div className="max-w-[78%] rounded-2xl border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-cyan-300">Josh is thinking…</div>}
              <div ref={endRef} />
            </div>

            <div className="border-t border-slate-700 p-4 sm:p-5">
              {error && <p role="alert" className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
              {trialFinished ? (
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                  <p className="font-semibold text-cyan-200">You've used your three free prompts.</p>
                  <p className="mt-1 text-sm text-slate-300">Get Josh AI access to continue learning with your personal tutor.</p>
                  <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-xl bg-cyan-400 px-5 py-2.5 font-bold text-slate-950 hover:bg-cyan-300">Get full access ↗</a>
                </div>
              ) : (
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    disabled={starting || !token || loading}
                    maxLength={2000}
                    placeholder={starting ? "Starting Josh…" : "Ask Josh a question…"}
                    aria-label="Message Josh"
                    className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-50"
                  />
                  <button type="submit" disabled={starting || !token || loading || !input.trim()} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40">Send</button>
                </form>
              )}
              <p className="mt-2 text-[11px] text-slate-500">Keep questions under 2,000 characters. Learn and practise only on systems you are authorised to use.</p>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Meet your AI tutor</p>
              <h2 className="mt-3 text-2xl font-bold">Learn at your pace.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Josh makes cybersecurity easier to understand, with practical examples and hints to help you solve problems yourself.</p>
              <ul className="mt-5 space-y-3 text-sm text-slate-200">
                <li>✦ Linux and networking</li><li>✦ Cybersecurity fundamentals</li><li>✦ Safe lab guidance</li><li>✦ Beginner-friendly explanations</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Josh AI premium</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Enjoy continued access to Josh after your free trial.</p>
              <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300">Get Josh AI access ↗</a>
              <p className="mt-3 text-xs leading-5 text-slate-500">Payment is handled securely by Revolut. Access is enabled after payment verification by the CyberLearn administrator.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
