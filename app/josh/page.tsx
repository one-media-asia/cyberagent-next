"use client";

import Link from "next/link";

const revolutCheckoutUrl =
  "https://checkout.revolut.com/pay/325622b3-0dd7-4f24-804f-98b9e59aa1fa";

export default function JoshPage() {
  return (
    <main className="min-h-screen bg-[#080d18] px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300">
          ← Back to CyberLearn
        </Link>

        <section className="mt-10 rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-7 shadow-2xl sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            CyberLearn premium
          </div>

          <div className="mt-6 grid gap-10 md:grid-cols-[1.3fr_0.7fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                Meet your AI tutor
              </p>
              <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl">
                Josh<span className="text-cyan-400"> AI.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Your personal cybersecurity learning assistant. Ask questions,
                understand difficult concepts, practise safely, and get help
                as you work through CyberLearn.
              </p>
              <a
                href={revolutCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Get Josh AI access <span className="ml-2">↗</span>
              </a>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                Secure payment is handled by Revolut. The current price and
                payment terms are shown at checkout.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-[#080d18] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Included with Josh
              </p>
              <ul className="mt-5 space-y-4 text-sm text-slate-200">
                <li className="flex gap-3"><span className="text-cyan-400">✦</span><span>Ask questions about Linux, networking and cybersecurity.</span></li>
                <li className="flex gap-3"><span className="text-cyan-400">✦</span><span>Get lessons explained in clear, practical steps.</span></li>
                <li className="flex gap-3"><span className="text-cyan-400">✦</span><span>Practise with hints, examples and knowledge checks.</span></li>
                <li className="flex gap-3"><span className="text-cyan-400">✦</span><span>Get guidance as you progress through your courses.</span></li>
              </ul>
            </div>
          </div>
        </section>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-6 text-slate-500">
          After payment, Josh AI access is enabled once the payment has been
          verified by the CyberLearn administrator. Keep your Revolut receipt
          until your access is confirmed.
        </p>
      </div>
    </main>
  );
}
