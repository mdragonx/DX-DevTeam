"use client";

import { useMemo, useState } from "react";
import { PersistedDashboard } from "../apps/web/src/persisted-dashboard";

const stages = ["Intake", "Specify", "Design", "Build", "Verify", "Deliver"];
const agents = [
  ["PO", "Product analyst", "Specification", "ready"],
  ["AR", "Software architect", "Architecture", "ready"],
  ["BE", "Backend engineer", "Implementation", "working"],
  ["CR", "Adversarial critic", "Counterexamples", "ready"],
  ["SE", "Security engineer", "Threat analysis", "ready"],
  ["QA", "Quality engineer", "Verification", "ready"],
];
const events = [
  ["Specification normalized", "PO", "All acceptance criteria are machine-verifiable", "2m ago"],
  ["Architecture challenged", "CR", "Race condition identified in job reservation", "1m ago"],
  ["Correction applied", "BE", "Atomic lease introduced with expiration", "42s ago"],
  ["Regression generated", "QA", "Concurrent reservation test added", "18s ago"],
];

function Icon({ name }: { name: "grid" | "project" | "agents" | "shield" | "docs" | "gear" }) {
  const paths = {
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    project: "M4 6h16M4 12h10M4 18h13",
    agents: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
    docs: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6",
    gear: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 3.46-.08-.02a1.7 1.7 0 0 0-1.79.42 1.7 1.7 0 0 0-.43 1.2H8.5a1.7 1.7 0 0 0-.43-1.2 1.7 1.7 0 0 0-1.79-.42l-.08.02-2-3.46.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.1-.88V10.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2-3.46.08.02a1.7 1.7 0 0 0 1.79-.42A1.7 1.7 0 0 0 8.5 2h7a1.7 1.7 0 0 0 .43 1.2 1.7 1.7 0 0 0 1.79.42l.08-.02 2 3.46-.06.06A1.7 1.7 0 0 0 19.4 9c.25.5.64.8 1.1.94v4.12c-.46.14-.85.44-1.1.94z",
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function Home() {
  const [projectName, setProjectName] = useState("Customer Billing Portal");
  const [requirement, setRequirement] = useState("Create a secure customer portal where users can view invoices, download receipts, and update their billing details.");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(3);
  const [notice, setNotice] = useState("Demonstration fixture — not an active autonomous run");
  const completeness = useMemo(() => Math.min(100, 42 + requirement.trim().length / 2), [requirement]);
  async function run() {
    if (!requirement.trim()) return;
    setRunning(true); setNotice("Persisting project, requirement, and run…");
    const response = await fetch("/api/control-plane/intake", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectName, statement: requirement, acceptanceCriteria: ["Requirement is reviewed against an explicit specification"], idempotencyKey: crypto.randomUUID() }) });
    if (!response.ok) { setRunning(false); setNotice("Delivery blocked: durable control plane rejected the request"); return; }
    setNotice("Durable run created; awaiting orchestrator lease"); setProgress(1); setRunning(false); window.location.reload();
  }
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">A</span><div><strong>Autonomy</strong><small>DEVELOPMENT OS</small></div></div>
        <nav aria-label="Main navigation">
          <a className="active" href="#overview"><Icon name="grid" />Overview</a>
          <a href="#projects"><Icon name="project" />Projects <span>3</span></a>
          <a href="#agents"><Icon name="agents" />Agent Center</a>
          <a href="#quality"><Icon name="shield" />Quality & Security</a>
          <a href="#evidence"><Icon name="docs" />Evidence</a>
        </nav>
        <div className="sidebar-bottom">
          <a href="#settings"><Icon name="gear" />Settings</a>
          <div className="system-status"><i></i><div><strong>Interface demonstration</strong><small>Integrations not connected</small></div></div>
        </div>
      </aside>
      <section className="content" id="overview">
        <header><div><span className="eyebrow">CONTROL PLANE / OVERVIEW</span><h1>Good evening, Fernando.</h1><p>Your autonomous engineering organization is operating within policy.</p></div><div className="header-actions"><button className="icon-btn" aria-label="Notifications">●</button><div className="avatar">FA</div></div></header>
        <section className="intake-card">
          <div className="intake-head"><div><span className="pulse"></span><strong>Start an autonomous delivery</strong></div><span>Natural language intake</span></div>
          <input className="project-input" aria-label="Project name" value={projectName} onChange={e => setProjectName(e.target.value)} />
          <textarea aria-label="Product requirement" value={requirement} onChange={e => setRequirement(e.target.value)} />
          <div className="intake-foot"><div className="signals"><span>Specification {Math.round(completeness)}%</span><span>Risk: medium</span><span>Domain: fintech</span></div><button onClick={run} disabled={running || !requirement.trim()}>{running ? "Running…" : "Analyze & deliver"}<b>→</b></button></div>
        </section>
        <div className="status-strip"><span className={running ? "spinner" : "check"}>{running ? "" : "✓"}</span><strong>{notice}</strong><small>{running ? `Stage ${progress} of 6` : "Evidence-backed execution"}</small></div>
        <section className="workflow panel">
          <div className="panel-title"><div><span className="label">REPRESENTATIVE DELIVERY</span><h2>Customer Billing Portal</h2><p>DX-104 · Started 8 minutes ago</p></div><button className="ghost">View workspace ↗</button></div>
          <div className="stage-row">{stages.map((stage, i) => <div key={stage} className={`stage ${i < progress ? "done" : i === progress ? "current" : ""}`}><span>{i < progress ? "✓" : i + 1}</span><small>{stage}</small></div>)}</div>
          <div className="delivery-grid">
            <div><span className="metric-label">Requirements</span><strong>12 / 12</strong><div className="bar"><i style={{width:"100%"}} /></div><small>Machine-verifiable</small></div>
            <div><span className="metric-label">Quality gates</span><strong>8 / 10</strong><div className="bar amber"><i style={{width:"80%"}} /></div><small>Security scan running</small></div>
            <div><span className="metric-label">Corrections</span><strong>3</strong><div className="mini-note">2 bugs · 1 security issue</div><small>All resolved automatically</small></div>
            <div><span className="metric-label">Evidence</span><strong>47</strong><div className="mini-note green">Complete chain</div><small>Commit → artifact → tests</small></div>
          </div>
        </section>
        <PersistedDashboard />
        <div className="two-col">
          <section id="agents" className="panel agents"><div className="section-head"><div><span className="label">TEAM COMPOSITION</span><h2>Representative agents</h2></div><button className="text-btn">Agent Center →</button></div>
            <div className="agent-list">{agents.map(([code,name,work,status]) => <div className="agent" key={code}><span className="agent-avatar">{code}</span><div><strong>{name}</strong><small>{work}</small></div><i className={status}></i></div>)}</div>
            <div className="composer"><span>＋</span><div><strong>Agent Composer</strong><small>Created a fintech compliance specialist for this delivery</small></div><b>NEW</b></div>
          </section>
          <section id="quality" className="panel activity"><div className="section-head"><div><span className="label">LIVE AUDIT TRAIL</span><h2>Critical activity</h2></div><button className="text-btn">All evidence →</button></div>
            <div className="event-list">{events.map(([title,actor,desc,time],i) => <div className="event" key={title}><span className={`event-icon e${i}`}>{i===2?"↻":i===3?"✓":"◆"}</span><div><strong>{title}</strong><small>{desc}</small><em>{actor}</em></div><time>{time}</time></div>)}</div>
          </section>
        </div>
        <section id="evidence" className="bottom-grid">
          <div className="score-card"><div className="ring"><strong>94</strong><small>/ 100</small></div><div><span className="label">DELIVERY CONFIDENCE</span><h3>Fixture only — no release decision</h3><p>Two gates remain before autonomous deployment.</p></div></div>
          <div className="gate-card"><span>SECURITY</span><strong>No critical findings</strong><small>1 issue detected and auto-corrected</small></div>
          <div className="gate-card"><span>DOCUMENTATION</span><strong>Continuity gate passed</strong><small>7 technical artifacts generated</small></div>
        </section>
      </section>
    </main>
  );
}
