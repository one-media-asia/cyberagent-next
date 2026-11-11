"use client";
  
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
const fallbackCourses = [
  { id: "linux", icon: "⌘", title: "Linux Fundamentals", category: "SYSTEMS", level: "Beginner", lessons: 8, progress: 25, color: "cyan" },
  { id: "network", icon: "⌁", title: "Networking Basics", category: "NETWORKING", level: "Beginner", lessons: 10, progress: 0, color: "violet" },
  { id: "web", icon: "⌘", title: "Web Security Essentials", category: "WEB SECURITY", level: "Beginner", lessons: 12, progress: 0, color: "emerald" },
];

const tutorials = [
  { id: "wireshark", title: "Wireshark Basics", category: "NETWORK FORENSICS", summary: "Read packet captures and filter DNS traffic.", sections: [
    { heading: "What is Wireshark?", body: "Wireshark is a network protocol analyser. It lets you inspect packets from a capture file or an authorised network interface. For this academy, practise with sample evidence only." },
    { heading: "Start with a capture", body: "Open a provided .pcap or .pcapng training file in Wireshark. The packet list shows time, source, destination, protocol, length, and a short information summary." },
    { heading: "Filter DNS requests", body: "Enter dns in the display-filter bar and press Enter. This narrows the visible packets to DNS traffic. Select a query packet to inspect its details and the requested hostname." },
    { heading: "Your investigation checklist", body: "Note the time, client address, queried hostname, and whether the request is expected. A strange hostname is a clue, not proof of compromise. Correlate it with other authorised evidence before drawing conclusions." }
  ]},
  { id: "linux", title: "Linux Files and Directories", category: "LINUX FUNDAMENTALS", summary: "Navigate directories and reveal hidden files.", sections: [
    { heading: "Know your location", body: "pwd prints the current working directory. Use it to confirm where you are before inspecting or changing files." },
    { heading: "List files", body: "ls lists visible files and directories. ls -a also shows hidden names, which usually begin with a dot." },
    { heading: "Investigate safely", body: "Use these commands only in your own system or an authorised training environment. Read filenames carefully and avoid changing or deleting evidence." }
  ]},
  { id: "phishing", title: "Recognising Phishing", category: "WEB SECURITY", summary: "Identify suspicious messages and respond safely.", sections: [
    { heading: "Spot the warning signs", body: "Unexpected urgency, unfamiliar sign-in links, mismatched sender details, and requests for passwords or payment are common warning signs." },
    { heading: "Check independently", body: "Do not use the message link to sign in. Open the organisation's known official site or app independently and check for alerts there." },
    { heading: "Report, don't spread", body: "Use your organisation's approved reporting method. Do not forward suspicious links broadly or enter credentials into a page you do not trust." }
  ]}
];

const ctfChallenges = [
  { id: "ctf-network-wireshark", title: "Find the DNS Flag", category: "NETWORK FORENSICS", points: 100, tutorialId: "wireshark", description: "Inspect simulated packet data and find the planted flag.", scenario: "A training PC made several DNS requests. One hostname contains a flag token. Review the simulated capture.", evidence: ["10:14:02.110  192.168.1.20 → 192.168.1.1  DNS  query A example.com", "10:14:02.482  192.168.1.20 → 192.168.1.1  DNS  query A updates.example.net", "10:14:03.017  192.168.1.20 → 192.168.1.1  DNS  query A FLAG{dns_trail_found}.training", "10:14:04.200  192.168.1.20 → 192.168.1.1  DNS  query A example.org"], question: "Which hostname contains the hidden flag?", options: ["example.com", "updates.example.net", "FLAG{dns_trail_found}.training", "example.org"], answer: "FLAG{dns_trail_found}.training", explanation: "The third DNS query contains the flag token. In Wireshark, the display filter dns narrows a capture to DNS traffic." },
  { id: "ctf-linux-hidden-file", title: "The Hidden Note", category: "LINUX FORENSICS", points: 100, tutorialId: "linux", description: "Use basic Linux file-listing knowledge to find a clue.", scenario: "You are in an authorised practice directory. Hidden files are shown in this simulated listing.", evidence: ["$ ls", "readme.txt", "notes/", "$ ls -a", ".flag.txt", ".profile", "readme.txt", "notes/"], question: "Which command reveals hidden files on Linux?", options: ["ls -a", "pwd", "mkdir", "whoami"], answer: "ls -a", explanation: "The -a option includes names beginning with a dot. Only inspect files in your permitted practice directory." },
  { id: "ctf-web-phishing", title: "Trust the Link?", category: "WEB SECURITY", points: 100, tutorialId: "phishing", description: "Spot the warning signs in a mock sign-in message.", scenario: "A fictional service says your account will close in 10 minutes and asks you to sign in at secure-login.example.invalid.", evidence: ["FROM: support@example.invalid", "SUBJECT: URGENT — account closes in 10 minutes", "LINK: secure-login.example.invalid", "REQUEST: enter your password immediately"], question: "What is the safest next step?", options: ["Open the link immediately", "Reply with your password", "Visit the known official site independently and report the message", "Forward it to coworkers"], answer: "Visit the known official site independently and report the message", explanation: "Urgency and an unfamiliar sign-in link are warning signs. Avoid the supplied link and use the organisation's known official channel." }
];

const labs = [
  { id: "terminal", title: "Meet the Terminal", tag: "LINUX", time: "5 min", description: "Learn what commands do in a simulated terminal.", question: "Which command prints your current working directory?", options: ["ls", "pwd", "cd", "mkdir"], answer: "pwd", explanation: "pwd means print working directory. It displays your current location in the filesystem." },
  { id: "network", title: "Decode the Network", tag: "NETWORKING", time: "7 min", description: "Understand common network addresses.", question: "Which address is reserved for localhost on IPv4?", options: ["8.8.8.8", "192.168.1.1", "127.0.0.1", "1.1.1.1"], answer: "127.0.0.1", explanation: "127.0.0.1 is the IPv4 loopback address. It points back to the local machine." },
  { id: "web", title: "Spot the Phishing", tag: "AWARENESS", time: "6 min", description: "Recognize common signs of suspicious messages.", question: "An email asks you to sign in urgently using an unfamiliar link. What should you do first?", options: ["Click quickly", "Reply with your password", "Verify through the official website", "Forward it to everyone"], answer: "Verify through the official website", explanation: "Avoid the supplied link. Navigate to the known official website independently and report suspicious messages through approved channels." },
  { id: "linux-files", title: "Linux File Detective", tag: "LINUX", time: "8 min", description: "Use safe read-only commands to inspect a practice directory.", question: "Which command lists files including hidden names in the current directory?", options: ["ls -a", "rm -rf", "shutdown", "chmod 777"], answer: "ls -a", explanation: "The -a option includes hidden entries. In real investigations, prefer read-only inspection and work only in authorised directories." },
  { id: "dns-basics", title: "Trace a DNS Lookup", tag: "NETWORKING", time: "8 min", description: "Follow a fictional hostname lookup from query to answer.", question: "What does DNS primarily translate for most everyday web browsing?", options: ["Domain names to IP addresses", "Passwords to hashes", "Files to folders", "Private keys to certificates"], answer: "Domain names to IP addresses", explanation: "DNS resolves names such as training.example to records, often including IP addresses. A DNS result alone does not prove a site is trustworthy." },
  { id: "http-status", title: "Read the Web Response", tag: "WEB SECURITY", time: "7 min", description: "Interpret common HTTP status codes using sample responses.", question: "Which HTTP status code commonly means the request succeeded?", options: ["200", "404", "500", "301"], answer: "200", explanation: "HTTP 200 means OK. 404 indicates a resource was not found; 500 indicates a server error; 301 is a redirect." },
  { id: "password-hygiene", title: "Password Safety Check", tag: "DEFENCE", time: "6 min", description: "Choose safer account-protection practices.", question: "What is the best way to reduce risk from password reuse?", options: ["Use one password everywhere", "Use a password manager and unique passwords", "Share passwords with teammates", "Store passwords in a public note"], answer: "Use a password manager and unique passwords", explanation: "Unique passwords limit the impact of a breach on another service. A password manager helps create and store them; enable MFA where possible." },
  { id: "incident-triage", title: "First Response Triage", tag: "INCIDENT RESPONSE", time: "9 min", description: "Practise the first safe steps after a suspicious alert.", question: "You notice an unexpected security alert on a work device. What should you do first?", options: ["Delete all logs", "Follow the incident reporting procedure and preserve evidence", "Post details publicly", "Install an unknown cleanup tool"], answer: "Follow the incident reporting procedure and preserve evidence", explanation: "Use your organisation's incident process, preserve relevant evidence, and avoid unapproved changes that could destroy useful information." },
  { id: "mfa-basics", title: "Secure the Account", tag: "IDENTITY", time: "6 min", description: "Learn how multi-factor authentication strengthens sign-in.", question: "Why is multi-factor authentication useful?", options: ["It adds another proof of identity", "It makes every email safe", "It replaces all software updates", "It hides every network address"], answer: "It adds another proof of identity", explanation: "MFA adds a second factor beyond a password, making stolen passwords less sufficient on their own. Prefer phishing-resistant methods when available." },
  { id: "linux-permissions", title: "Linux Permissions & Ownership", tag: "LINUX SECURITY", time: "9 min", description: "Understand read, write and execute permissions, users and groups.", question: "Which command changes the permissions of a file?", options: ["chown", "chmod", "pwd", "whoami"], answer: "chmod", explanation: "chmod changes a file or directory's permission bits. chown changes ownership. Use the least privilege needed and avoid broad permissions such as 777." },
  { id: "network-ports", title: "Ports & Network Services", tag: "NETWORKING", time: "8 min", description: "Identify common service ports and why exposed services matter.", question: "Which port is commonly used by HTTPS?", options: ["21", "22", "80", "443"], answer: "443", explanation: "HTTPS commonly uses TCP port 443. Port numbers help identify expected services, but an open port alone does not prove a service is vulnerable." },
  { id: "linux-permissions-practice", title: "Permission Check: The Shared Report", tag: "LINUX SECURITY", time: "10 min", description: "Inspect a simulated file mode and choose a least-privilege permission.", question: "A report should be readable and writable by its owner, readable by its group, and inaccessible to everyone else. Which numeric mode fits?", options: ["777", "755", "640", "600"], answer: "640", explanation: "640 means owner read/write (6), group read-only (4), and others no access (0). This follows least privilege. In a real system, confirm the required group and access policy before changing permissions." },
  { id: "linux-ownership-practice", title: "Ownership Check: Team Handover", tag: "LINUX SECURITY", time: "9 min", description: "Learn how file ownership and group ownership work in Linux.", question: "Which command changes the owner of a file to alex?", options: ["chmod alex report.txt", "chown alex report.txt", "pwd alex report.txt", "ls alex report.txt"], answer: "chown alex report.txt", explanation: "chown changes a file's owner. For example, chown alex report.txt sets alex as the owner. Changing group ownership can use chown :team report.txt. Run ownership changes only when authorised." },
  { id: "dns-records-practice", title: "DNS Detective: Find the Web Server", tag: "NETWORKING", time: "9 min", description: "Read a simulated DNS zone and identify the address used by a website.", question: "The training zone shows portal.training.example. IN A 203.0.113.24. Which record type maps the hostname to an IPv4 address?", options: ["MX", "TXT", "A", "CNAME"], answer: "A", explanation: "An A record maps a hostname to an IPv4 address. MX records identify mail exchangers, TXT records hold text data, and CNAME records create aliases. The address 203.0.113.24 is from a documentation-only range, not a real target." },
  { id: "http-security-headers", title: "HTTP Security Headers", tag: "WEB SECURITY", time: "10 min", description: "Inspect a simulated HTTP response and recognise useful browser security headers.", question: "Which response header tells browsers to restrict a page to HTTPS connections?", options: ["Content-Type", "Strict-Transport-Security", "Server", "Cache-Control"], answer: "Strict-Transport-Security", explanation: "Strict-Transport-Security (HSTS) tells a browser to use HTTPS for future requests to the host for a specified period. It should only be enabled after HTTPS is correctly configured. Other useful headers include Content-Security-Policy, X-Content-Type-Options and Referrer-Policy." },
];

export default function Home() {
  const [courses, setCourses] = useState(fallbackCourses);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);

  useEffect(() => {
   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academy/learning-paths/`)
      .then((r) => { if (!r.ok) throw new Error("Course API error"); return r.json(); })
      .then((data) => setCourses(data.map((c: any) => ({
        id: String(c.id), icon: "⌘", title: c.title,
        category: c.category.toUpperCase(),
        level: c.level.charAt(0).toUpperCase() + c.level.slice(1),
        lessons: 5, progress: 0,
        color: c.category.toLowerCase().includes("network") ? "violet" : c.category.toLowerCase().includes("web") ? "emerald" : "cyan"
      }))))
      .catch((e) => console.error("Could not load courses:", e));
  }, []);

  useEffect(() => {
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/academy/learning-paths/`)    
  .then((r) => { if (!r.ok) throw new Error("Learning paths API error"); return r.json(); })
      .then((data) => setLearningPaths(data))
      .catch((e) => console.error("Could not load learning paths:", e));
  }, []);

  const [tab, setTab] = useState("Overview");
  const [activeLab, setActiveLab] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<string[]>([]);
  const [showResources, setShowResources] = useState(false);
  const [activeCtf, setActiveCtf] = useState<string | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [ctfAnswers, setCtfAnswers] = useState<Record<string, string>>({});
  const [completedCtf, setCompletedCtf] = useState<string[]>([]);

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
    setCompletedCtf((data ?? []).filter((item) => item.completed).map((item) => item.course_id).filter((id) => ctfChallenges.some((challenge) => challenge.id === id)));
  }

  loadProgress();
}, [userId]);

  const lab = labs.find((item) => item.id === activeLab);
  const ctf = ctfChallenges.find((item) => item.id === activeCtf);
  const tutorial = tutorials.find((item) => item.id === activeTutorial);

  async function submitCtfFlag(id: string, answer: string) {
    setCtfAnswers((old) => ({ ...old, [id]: answer }));
    const challenge = ctfChallenges.find((item) => item.id === id);
    if (!challenge || answer !== challenge.answer || completedCtf.includes(id)) return;
    if (!userId) { alert("Please sign in to save CTF progress."); return; }
    const { error } = await supabase.from("learning_progress").upsert(
      { user_id: userId, course_id: id, completed: true, quiz_score: 100, updated_at: new Date().toISOString() },
      { onConflict: "user_id,course_id" }
    );
    if (error) { console.error("Could not save CTF progress:", error.message); alert("The flag was correct, but progress could not be saved. Please try again."); return; }
    setCompletedCtf((old) => old.includes(id) ? old : [...old, id]);
  }
  const score = completed.length;
  const progress = Math.round((completed.length / labs.length) * 100);

async function chooseAnswer(id: string, answer: string) {
    setAnswers((old) => ({ ...old, [id]: answer }));

    const currentLab = labs.find((item) => item.id === id);
    if (!currentLab || answer !== currentLab.answer) return;

    if (!userId) {
      alert("Correct answer! Sign in to save your progress.");
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
      alert("Your answer is correct, but progress could not be saved. Please try again.");
      return;
    }

    setCompleted((old) =>
      old.includes(id) ? old : [...old, id]
    );
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-slate-100">
      <aside className="sidebar">
        <a href="#" className="brand"><span className="brand-icon">C</span><span>cyber<span className="text-cyan-400">learn</span><small>SECURITY ACADEMY</small></span></a>
        <p className="nav-label">LEARN</p>
        {["Overview", "Learning paths", "Hands-on labs", "Capture the Flag", "Resources"].map((item, i) => (
          <button key={item} onClick={() => { setTab(item); setActiveLab(null); setActiveCtf(null); setActiveTutorial(null); setShowResources(item === "Resources"); }} className={`nav-item ${tab === item ? "nav-active" : ""}`}>
            <span>{["◫", "▤", "⌘", "⚑", "↗"][i]}</span>{item}
            {item === "Hands-on labs" && <span className="nav-count">{labs.length}</span>}
            {item === "Capture the Flag" && <span className="nav-count">{ctfChallenges.length}</span>}
          </button>
        ))}
        <Link href="/josh" className="nav-item"><span>✦</span>Josh AI</Link>
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
          {activeTutorial && tutorial ? (
            <div className="max-w-3xl">
              <button className="back-button" onClick={() => setActiveTutorial(null)}>← Back to Resources</button>
              <div className="panel lab-detail mt-5">
                <span className="eyebrow">ON-SITE TUTORIAL · {tutorial.category}</span>
                <h1 className="page-title mt-3">{tutorial.title}</h1>
                <p className="muted mt-3">{tutorial.summary}</p>
                {tutorial.sections.map((section, i) => <section className="mt-7" key={section.heading}><span className="eyebrow">LESSON {i + 1}</span><h2 className="section-title mt-2">{section.heading}</h2><p className="muted mt-3">{section.body}</p></section>)}
                <div className="resource-banner mt-8"><div><span className="eyebrow">READY TO PRACTISE?</span><h2 className="section-title mt-2">Try a related challenge</h2><p className="muted mt-2">Put this tutorial into practice in a safe simulated mission.</p></div><button className="primary-button" onClick={() => { const related = ctfChallenges.find((challenge) => challenge.tutorialId === tutorial.id); setActiveTutorial(null); setActiveCtf(related?.id ?? null); setTab("Capture the Flag"); }}>Start challenge →</button></div>
              </div>
            </div>
          ) : activeCtf && ctf ? (
            <div className="max-w-3xl">
              <button className="back-button" onClick={() => setActiveCtf(null)}>← Back to Capture the Flag</button>
              <div className="panel lab-detail mt-5">
                <span className="eyebrow">{ctf.category} · {ctf.points} POINTS</span><h1 className="page-title mt-3">{ctf.title}</h1><p className="muted mt-3">{ctf.description}</p>
                <div className="feedback mt-5"><b>Mission briefing</b><p>{ctf.scenario}</p></div>
                <h2 className="section-title mt-7">Evidence / simulated output</h2>
                <div className="terminal mt-4"><div className="terminal-head"><span>●</span><span>●</span><span>●</span><b>cyberlearn · simulated evidence</b></div>{ctf.evidence.map((line) => <p className="terminal-output" key={line}>{line}</p>)}</div>
                <div className="panel p-5 mt-6"><span className="eyebrow">LEARN THIS SKILL ON CYBERLEARN</span><h2 className="section-title mt-2">{tutorials.find((item) => item.id === ctf.tutorialId)?.title}</h2><p className="muted mt-2">{tutorials.find((item) => item.id === ctf.tutorialId)?.summary}</p><button className="primary-button mt-4" onClick={() => { setActiveCtf(null); setActiveTutorial(ctf.tutorialId); setTab("Resources"); setShowResources(true); }}>Read tutorial here →</button></div>
                <h2 className="section-title mt-7">{ctf.question}</h2>
                <div className="mt-4 grid gap-3">{ctf.options.map((option, i) => { const selected = ctfAnswers[ctf.id] === option; const correct = option === ctf.answer; return <button key={option} onClick={() => submitCtfFlag(ctf.id, option)} className={`answer-option ${selected ? correct ? "answer-correct" : "answer-wrong" : ""}`}><span className="answer-letter">{String.fromCharCode(65 + i)}</span>{option}<span className="ml-auto">{selected ? correct ? "✓" : "×" : ""}</span></button>; })}</div>
                {ctfAnswers[ctf.id] && <div className="feedback mt-5"><b>{ctfAnswers[ctf.id] === ctf.answer ? "Flag captured — well done!" : "Not quite. Review the evidence and try again."}</b><p>{ctf.explanation}</p></div>}
                <div className="mt-6 flex flex-wrap gap-3"><button className="primary-button" onClick={() => setActiveCtf(null)}>Return to challenges</button>{completedCtf.includes(ctf.id) && <span className="status-pill">✓ Completed · +{ctf.points} XP</span>}</div>
              </div>
            </div>
          ) : activeLab && lab ? (
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
          ) : tab === "Capture the Flag" ? (
            <>
              <span className="eyebrow">MISSION BOARD · SAFE PRACTICE ONLY</span><h1 className="page-title mt-2">Capture the Flag<span className="text-cyan-400">.</span></h1><p className="muted mt-2 max-w-xl">Solve security puzzles, capture flags, and earn XP. Every challenge links to a tutorial hosted right here on CyberLearn.</p>
              <div className="stats-grid mt-7"><Stat label="CHALLENGES" value={String(ctfChallenges.length)} hint="Beginner missions" icon="⚑"/><Stat label="FLAGS FOUND" value={`${completedCtf.length}/${ctfChallenges.length}`} hint="Saved to your account" icon="✧"/><Stat label="CTF XP" value={String(completedCtf.length * 100)} hint="100 points per flag" icon="↗"/><Stat label="NEXT MISSION" value={completedCtf.length === ctfChallenges.length ? "Complete" : "Ready"} hint="Keep investigating" icon="⚡"/></div>
              <div className="lab-grid">{ctfChallenges.map((challenge) => <button className="panel lab-card text-left" key={challenge.id} onClick={() => setActiveCtf(challenge.id)}><div className="flex items-center justify-between"><span className="lab-icon">⚑</span><span className="eyebrow">{challenge.points} POINTS</span></div><span className="tag mt-5">{challenge.category}</span><h3>{challenge.title}</h3><p className="muted">{challenge.description}</p><div className="lab-footer"><span>{completedCtf.includes(challenge.id) ? "✓ Flag captured" : "Start mission"}</span><span>→</span></div></button>)}</div>
            </>
          ) : showResources ? (
            <>
              <span className="eyebrow">YOUR TOOLKIT</span><h1 className="page-title mt-2">CyberLearn Resources</h1><p className="muted mt-2">Guides and tutorials hosted on CyberLearn, so you can learn and practise without leaving the site.</p>
              <div className="resource-grid mt-7">{tutorials.map((item) => <button className="panel resource-card text-left" key={item.id} onClick={() => setActiveTutorial(item.id)}><span className="eyebrow">ON-SITE TUTORIAL · {item.category}</span><h3>{item.title} →</h3><p className="muted">{item.summary}</p><p className="muted mt-3">{item.sections.length} short lessons · Free</p></button>)}</div>
            </>
          ) : tab === "Learning paths" ? (
            <><span className="eyebrow">YOUR CURRICULUM</span><h1 className="page-title mt-2">Learning paths</h1><p className="muted mt-2">Build skills in the right order, starting from zero.</p><div className="course-grid mt-7">{learningPaths.map((path) => <div className="panel course-card" key={path.id}><span className="eyebrow">LEARNING PATH</span><h3>{path.title}</h3><p className="muted">{path.description}</p><p className="muted mt-3">{path.courses.length} course{path.courses.length === 1 ? "" : "s"}: {path.courses.map((course: any) => course.title).join(", ")}</p><button className="primary-button mt-5" onClick={() => { setTab("Hands-on labs"); setActiveLab(path.slug.includes("linux") ? "terminal" : path.slug.includes("network") ? "network" : "web"); }}>Explore path →</button></div>)}</div></>
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

function CourseCard({ course, onClick }: { course: (typeof fallbackCourses)[number]; onClick: () => void }) {
  return <button className="panel course-card text-left" onClick={onClick}><div className="course-top"><span className={`course-icon ${course.color}`}>{course.icon}</span><span className="eyebrow">{course.category}</span></div><h3>{course.title}</h3><p className="muted">{course.level} · {course.lessons} lessons</p><div className="progress-track mt-5"><div className="progress-fill" style={{ width: `${course.progress}%` }}/></div><div className="course-bottom"><span>{course.progress}% complete</span><span>Explore →</span></div></button>;
}
