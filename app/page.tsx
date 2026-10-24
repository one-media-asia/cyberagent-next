"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
const courses = [
  { id: "linux", icon: "⌘", title: "Linux Fundamentals", category: "SYSTEMS", level: "Beginner", lessons: 8, progress: 25, color: "cyan" },
  { id: "network", icon: "⌁", title: "Networking Basics", category: "NETWORKING", level: "Beginner", lessons: 10, progress: 0, color: "violet" },
  { id: "web", icon: "⌘", title: "Web Security Essentials", category: "WEB SECURITY", level: "Beginner", lessons: 12, progress: 0, color: "emerald" },
];

const labs = [
  { id: "terminal", title: "Meet the Terminal", tag: "LINUX", time: "5 min", description: "Learn what commands do in a simulated terminal.", question: "Which command prints your current working directory?", options: ["ls", "pwd", "cd", "mkdir"], answer: "pwd", explanation: "pwd means print working directory. It displays your current location in the filesystem." },
  { id: "network", title: "Decode the Network", tag: "NETWORKING", time: "7 min", description: "Understand common network addresses.", question: "Which address is reserved for localhost on IPv4?", options: ["8.8.8.8", "192.168.1.1", "127.0.0.1", "1.1.1.1"], answer: "127.0.0.1", explanation: "127.0.0.1 is the IPv4 loopback address. It points back to the local machine." },
  { id: "web", title: "Spot the Phishing", tag: "AWARENESS", time: "6 min", description: "Recognize common signs of suspicious messages.", question: "An email asks you to sign in urgently using an unfamiliar link. What should you do first?", options: ["Click quickly", "Reply with your password", "Verify through the official website", "Forward it to everyone"], answer: "Verify through the official website", explanation: "Avoid the supplied link. Navigate to the known official website independently and report suspicious messages through approved channels." },
];

export default function Home() {
  const [tab, setTab] = useState("Overview");
  const [activeLab, setActiveLab] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<string[]>([]);
  const [showResources, setShowResources] = useState(false);

const [userEmail, setUserEmail] = useState<string | null>(null);
const [userId, setUserId] = useState<string | null>(null);
useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUserEmail(data.user?.email ?? null);
setUserId(data.user?.id ?? null);  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
  setUserEmail(session?.user?.email ?? null);
  setUserId(session?.user?.id ?? null);
});

  return () => subscription.unsubscribe();
}, []);

useEffect(() => {
  if (!userId) {
    setCompleted([]);
    setAnswers({});
    return;
  }

  async function loadProgress() {
    const { data, error } = await supabase
      .from("learning_progress")
      .select("course_id, completed")
      .eq("user_id", userId);

    if (error) {
      console.error("Could not load learning progress:", error.message);
      return;
    }

    const savedCompleted = (data ?? [])
      .filter((item) => item.completed)
      .map((item) => item.course_id)
      .filter((id) => labs.some((lab) => lab.id === id));

    setCompleted(savedCompleted);
  }

  loadProgress();
}, [userId]);

  const lab = labs.find((item) => item.id === activeLab);
  const score = completed.length;
  const progress = Math.round((completed.length / labs.length) * 100);

 async function chooseAnswer(id: string, answer: string) {
  setAnswers((old) => ({ ...old, [id]: answer }));

  const currentLab = labs.find((item) => item.id === id);
  if (!currentLab || answer !== currentLab.answer) return;

  setCompleted((old) =>
    old.includes(id) ? old : [...old, id]
  );

  if (!userId) {
    alert("Please sign in to save your progress.");
    return;
  }

  const { error } = await supabase
    .from("learning_progress")
    .upsert(
      {
        user_id: userId,
        course_id: id,
        completed: true,
        quiz_score: 100,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id" }
    );

  if (error) {
    console.error("Could not save progress:", error.message);
    alert("Progress could not be saved. Please try again.");
  }  }

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <aside className="sidebar">
        <a href="#" className="brand"><span className="brand-icon">C</span><span>cyber<span className="text-cyan-400">learn</span><small>SECURITY ACADEMY</small></span></a>
        <p className="nav-label">LEARN</p>
        {["Overview", "Learning paths", "Hands-on labs", "Resources"].map((item, i) => (
          <button key={item} onClick={() => { setTab(item); setActiveLab(null); setShowResources(item === "Resources"); }} className={`nav-item ${tab === item ? "nav-active" : ""}`}>
            <span>{["◫", "▤", "⌘", "↗"][i]}</span>{item}
            {item === "Hands-on labs" && <span className="nav-count">{labs.length}</span>}
          </button>
        ))}
        <div className="sidebar-bottom"><div className="online-dot" /> All labs run in safe simulations <p>CYBERLEARN · PREVIEW 0.1</p></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div className="breadcrumb">Academy <span>/</span> {tab}</div><div className="top-right">{userEmail ? (
  <>
    <span className="text-sm text-cyan-400">{userEmail}</span>
    <button
      onClick={async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
          alert("Sign out failed: " + error.message)
          return
        }
        setUserEmail(null)
        window.location.href = "/"
      }}
      className="text-sm text-cyan-400 hover:text-cyan-300"
    >
      Sign out
    </button>
  </>
) : (
  <a href="/login" className="text-sm text-cyan-400 hover:text-cyan-300">
    Sign in / Create account
  </a>
)}<span className="status-pill"><span className="online-dot" /> Learning mode</span><div className="avatar">CL</div></div></header>
        <div className="content">
          {activeLab && lab ? (
            <div className="max-w-3xl">
              <button className="back-button" onClick={() => setActiveLab(null)}>← Back to labs</button>
              <div className="panel lab-detail mt-5">
                <span className="eyebrow">{lab.tag} · {lab.time.toUpperCase()}</span>
                <h1 className="page-title mt-3">{lab.title}</h1>
                <p className="muted mt-3">{lab.description}</p>
                <div className="terminal mt-7"><div className="terminal-head"><span>●</span><span>●</span><span>●</span><b>cyberlearn · safe environment</b></div><p><span className="text-emerald-400">learner@cyberlearn:~$</span> start-lab {lab.id}</p><p className="terminal-output">Simulation ready. No external systems are accessed.</p></div>
                <h2 className="section-title mt-8">{lab.question}</h2>
                <div className="mt-4 grid gap-3">{lab.options.map((option, i) => {
                  const selected = answers[lab.id] === option;
                  const correct = option === lab.answer;
                  return <button key={option} onClick={() => chooseAnswer(lab.id, option)} className={`answer-option ${selected ? correct ? "answer-correct" : "answer-wrong" : ""}`}><span className="answer-letter">{String.fromCharCode(65 + i)}</span>{option}<span className="ml-auto">{selected ? correct ? "✓" : "×" : ""}</span></button>;
                })}</div>
                {answers[lab.id] && <div className="feedback mt-5"><b>{answers[lab.id] === lab.answer ? "Correct — well done!" : "Not quite. Try again."}</b><p>{lab.explanation}</p></div>}
                <div className="mt-6 flex flex-wrap gap-3"><button className="primary-button" onClick={() => setActiveLab(null)}>Return to labs</button>{answers[lab.id] === lab.answer && <span className="status-pill">+100 XP earned</span>}</div>
              </div>
            </div>
          ) : showResources ? (
            <>
              <span className="eyebrow">YOUR TOOLKIT</span><h1 className="page-title mt-2">Free resources</h1><p className="muted mt-2">Trusted places to continue your cybersecurity journey.</p>
              <div className="resource-grid mt-7">
                {[["OverTheWire","Linux and security wargames","https://overthewire.org/wargames/"],["OWASP","Web application security guides","https://owasp.org/www-project-top-ten/"],["Cisco Skills for All","Networking and cybersecurity courses","https://skillsforall.com/"],["PortSwigger Academy","Free web security training labs","https://portswigger.net/web-security"],["MDN Web Docs","Learn how the web works","https://developer.mozilla.org/"],["TryHackMe","Guided cybersecurity learning","https://tryhackme.com/"]].map(([name, desc, url]) => <a className="panel resource-card" href={url} target="_blank" rel="noreferrer" key={name}><span className="eyebrow">FREE LEARNING</span><h3>{name} ↗</h3><p className="muted">{desc}</p></a>)}
              </div>
            </>
          ) : tab === "Learning paths" ? (
            <><span className="eyebrow">YOUR CURRICULUM</span><h1 className="page-title mt-2">Learning paths</h1><p className="muted mt-2">Build skills in the right order, starting from zero.</p><div className="course-grid mt-7">{courses.map((course) => <CourseCard key={course.id} course={course} onClick={() => { setTab("Hands-on labs"); setActiveLab(course.id === "linux" ? "terminal" : course.id === "network" ? "network" : "web"); }} />)}</div></>
          ) : tab === "Hands-on labs" ? (
            <><span className="eyebrow">PRACTICE ZONE</span><h1 className="page-title mt-2">Hands-on labs<span className="text-cyan-400">.</span></h1><p className="muted mt-2">Learn by doing in safe, simulated exercises.</p><div className="lab-grid mt-7">{labs.map((item) => <button className="panel lab-card text-left" key={item.id} onClick={() => setActiveLab(item.id)}><div className="flex items-center justify-between"><span className="lab-icon">⌘</span><span className="eyebrow">{item.time.toUpperCase()}</span></div><span className="tag mt-5">{item.tag}</span><h3>{item.title}</h3><p className="muted">{item.description}</p><div className="lab-footer"><span>{completed.includes(item.id) ? "✓ Completed" : "Start exercise"}</span><span>→</span></div></button>)}</div></>
          ) : (
            <>
              <div className="welcome-row"><div><span className="eyebrow"><span className="online-dot inline-block mr-2" /> YOUR CYBERSECURITY JOURNEY STARTS HERE</span><h1 className="page-title mt-3">Learn to think like a<br/><span className="gradient-text">defender.</span></h1><p className="muted mt-4 max-w-xl">Practical cybersecurity skills, beginner-friendly lessons, and safe labs. Start from zero. Build real-world confidence.</p><button className="primary-button mt-6" onClick={() => { setTab("Hands-on labs"); setActiveLab(null); setShowResources(false); }}>Explore training labs <span>→</span></button></div><div className="hero-graphic"><div className="hero-ring ring-one"/><div className="hero-ring ring-two"/><div className="shield">⌑</div><span className="orbit orbit-a">01</span><span className="orbit orbit-b">SECURE</span><span className="orbit orbit-c">LEARN</span></div></div>
              <div className="stats-grid"><Stat label="LABS COMPLETED" value={`${completed.length}/${labs.length}`} hint="Keep practising" icon="⌘"/><Stat label="TOTAL XP" value={`${score * 100}`} hint="Earn XP by learning" icon="✧"/><Stat label="LAB PROGRESS" value={`${progress}%`} hint="Your current journey" icon="↗"/><Stat label="LEARNING STREAK" value={completed.length ? "Active" : "Start"} hint="One lab at a time" icon="⚡"/></div>
              <div className="section-heading"><div><span className="eyebrow">YOUR CURRICULUM</span><h2 className="section-title mt-2">Start with the essentials</h2></div><button className="text-link" onClick={() => setTab("Learning paths")}>All learning paths →</button></div>
              <div className="course-grid">{courses.map((course) => <CourseCard key={course.id} course={course} onClick={() => { setTab("Learning paths"); setActiveLab(null); }} />)}</div>
              <div className="section-heading mt-10"><div><span className="eyebrow">LEARN BY DOING</span><h2 className="section-title mt-2">Jump into a lab</h2></div><button className="text-link" onClick={() => setTab("Hands-on labs")}>All labs →</button></div>
              <div className="lab-grid">{labs.map((item) => <button className="panel lab-card text-left" key={item.id} onClick={() => setActiveLab(item.id)}><div className="flex items-center justify-between"><span className="lab-icon">⌘</span><span className="eyebrow">{item.time.toUpperCase()}</span></div><span className="tag mt-5">{item.tag}</span><h3>{item.title}</h3><p className="muted">{item.description}</p><div className="lab-footer"><span>{completed.includes(item.id) ? "✓ Completed" : "Start exercise"}</span><span>→</span></div></button>)}</div>
              <div className="resource-banner mt-10"><div><span className="eyebrow">KEEP EXPLORING</span><h2 className="section-title mt-2">Your next skill is one click away.</h2><p className="muted mt-2">Explore free tools, trusted guides and external training platforms.</p></div><button className="primary-button" onClick={() => { setTab("Resources"); setShowResources(true); }}>Browse resources →</button></div>
            </>
          )}
          <footer className="footer"><span>CYBERLEARN © 2026</span><span>Built for learners. Designed for defenders.</span><span><span className="online-dot inline-block mr-2"/> SAFE PRACTICE ONLY</span></footer>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: string }) {
  return <div className="panel stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value}</div><div className="muted text-xs mt-2">{hint}</div></div>;
}

function CourseCard({ course, onClick }: { course: (typeof courses)[number]; onClick: () => void }) {
  return <button className="panel course-card text-left" onClick={onClick}><div className="course-top"><span className={`course-icon ${course.color}`}>{course.icon}</span><span className="eyebrow">{course.category}</span></div><h3>{course.title}</h3><p className="muted">{course.level} · {course.lessons} lessons</p><div className="progress-track mt-5"><div className="progress-fill" style={{ width: `${course.progress}%` }}/></div><div className="course-bottom"><span>{course.progress}% complete</span><span>Explore →</span></div></button>;
}
