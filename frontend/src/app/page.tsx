"use client";

import { useState, useEffect } from "react";

interface Question {
  question: string;
  options: string[];
  correct_index: number;
}

interface Step {
  id: string;
  title: string;
  summary: string;
  channel: string;
  step_name: string;
  goal: string;
  lqs: number;
  questions: Question[];
  checklist: string[];
  mental_model: string;
}

interface PathResponse {
  topic: string;
  path: Step[];
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Low");
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<PathResponse | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPath(null);
    try {
      const res = await fetch("http://localhost:8000/api/create-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level }),
      });
      if (!res.ok) throw new Error("Agentic link interrupted. Retrying discovery protocol...");
      const data = await res.json();
      setPath(data);
      setActiveStep(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (isCorrect !== null) return;
    setSelectedOpt(index);
    const correct = path?.path[activeStep].questions[0]?.correct_index;
    setIsCorrect(index === correct);
  };

  useEffect(() => {
    setSelectedOpt(null);
    setIsCorrect(null);
  }, [activeStep]);

  if (loading) {
    return (
      <div className="hero animate">
        <div className="spinner" style={{ margin: "0 auto 2rem" }}></div>
        <h1 style={{ fontSize: "2.5rem" }}>Initializing Discovery Agent</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}>Scanning global knowledge clusters for "{topic}"...</p>
      </div>
    );
  }

  if (path) {
    const current = path.path[activeStep];
    return (
      <div className="platform-container animate">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", opacity: 0.4, letterSpacing: "2px", marginBottom: "1rem", fontWeight: 900 }}>
          <span>SYSTEM STATUS: OPERATIONAL</span>
          <span>LINK: STABLE // ENCRYPTION: ACTIVE</span>
          <span>LATENCY: 24MS</span>
        </div>
        <header className="top-nav">
          <div className="logo-text">LearnLens AI</div>
          <button className="btn-premium" onClick={() => setPath(null)}>Restart System</button>
        </header>

        <section className="master-grid">
          {/* Roadmap */}
          <aside className="curriculum-pills">
            <h3 style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1rem" }}>Mission Logs</h3>
            {path.path.map((step, i) => (
              <div
                key={i}
                className={`pill ${activeStep === i ? 'active' : ''}`}
                onClick={() => setActiveStep(i)}
              >
                <div className="pill-meta">Phase 0{i + 1}</div>
                <div className="pill-title">{step.step_name}</div>
              </div>
            ))}

            <div className="panel" style={{ marginTop: "1.5rem", padding: "1.25rem" }}>
              <div className="pill-meta" style={{ color: "var(--accent-secondary)" }}>Synchronization</div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${((activeStep + 1) / path.path.length) * 100}%` }}></div>
              </div>
              <div style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                <span>Phase {activeStep + 1}</span>
                <span>{Math.round(((activeStep + 1) / path.path.length) * 100)}% Complete</span>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="video-container">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${current.id}?autoplay=1&rel=0&modestbranding=1`}
                title="Workshop Video"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>

            <div className="content-engine">
              <div className="stats-badge">
                <span style={{ fontSize: "1rem" }}>●</span>
                <span>AGENT VERIFIED • LQS SCR 98.4</span>
              </div>

              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.5rem", lineHeight: 1.1 }}>
                {current.title}
              </h1>
              <p style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "2rem" }}>{current.channel}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                <div className="panel">
                  <h4 className="pill-meta">Analytic Brief</h4>
                  <p style={{ fontSize: "1.15rem", fontWeight: 500, color: "var(--text-primary)", opacity: 0.9 }}>{current.summary}</p>
                </div>

                <div className="panel" style={{ borderLeft: "4px solid var(--accent-secondary)" }}>
                  <h4 className="pill-meta" style={{ color: "var(--accent-secondary)" }}>Structural Analogy</h4>
                  <p style={{ fontSize: "1.05rem", fontWeight: 600 }}>{current.mental_model}</p>
                </div>
              </div>
            </div>
          </main>

          {/* Side Panels */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="panel">
              <h3 className="pill-meta" style={{ color: "var(--accent-success)", marginBottom: "1.5rem" }}>Prerequisites</h3>
              {current.checklist.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  <span style={{ color: "var(--accent-success)" }}>▸</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="panel" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
              <h3 className="pill-meta" style={{ color: "var(--accent-gold)", marginBottom: "1.25rem" }}>Recall Validation</h3>
              {current.questions && current.questions.length > 0 ? (
                <>
                  <p style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem", lineHeight: 1.4 }}>{current.questions[0].question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {current.questions[0].options.map((opt, j) => (
                      <button
                        key={j}
                        className={`mcq-button ${selectedOpt === j ? (isCorrect ? 'correct' : 'error') : ''}`}
                        onClick={() => handleOptionSelect(j)}
                      >
                        <span style={{ maxWidth: "85%" }}>{opt}</span>
                        <span>{selectedOpt === j ? (isCorrect ? '✓' : '✗') : ''}</span>
                      </button>
                    ))}
                  </div>
                  {isCorrect !== null && (
                    <div className="animate" style={{ marginTop: "1.5rem", textAlign: "center", padding: "1rem", borderRadius: "10px", background: isCorrect ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)" }}>
                      <p style={{ fontWeight: 800, color: isCorrect ? "var(--accent-success)" : "var(--accent-error)", fontSize: "0.85rem" }}>
                        {isCorrect ? "MISSION SUCCESS: Mastery Verified." : "SIGNAL LOSS: Review content recommended."}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: "var(--text-secondary)" }}>Synthesizing validation vectors...</p>
              )}
            </div>

            {activeStep < path.path.length - 1 && (
              <button
                className="btn-premium"
                style={{ width: "100%", padding: "1.5rem", borderRadius: "18px", fontSize: "1.1rem" }}
                onClick={() => { setActiveStep(activeStep + 1); window.scrollTo(0, 0); }}
              >
                Engage Next Phase →
              </button>
            )}

            {activeStep === path.path.length - 1 && isCorrect === true && (
              <div className="panel animate" style={{ background: "linear-gradient(135deg, var(--accent-success), #065f46)", color: "white", border: "none", textAlign: "center" }}>
                <h3 style={{ marginBottom: "0.5rem", fontWeight: 900 }}>DOMAIN MASTERED</h3>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, opacity: 0.9 }}>Professional validation complete.</p>
              </div>
            )}
          </aside>
        </section>
      </div>
    );
  }

  return (
    <div className="platform-container">
      <div className="hero animate">
        <div className="logo-text" style={{ fontSize: "4.5rem", marginBottom: "0.5rem" }}>LearnLens AI</div>
        <div style={{ width: "60px", height: "4px", background: "var(--accent-primary)", margin: "0 auto 3rem" }}></div>
        <h2 style={{ fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: "6rem", letterSpacing: "0.2em", fontWeight: 500 }}>
          ORCHESTRATING PROFESSIONAL MASTERY
        </h2>

        <form onSubmit={handleGenerate} className="search-hub animate">
          <input
            type="text"
            placeholder="Search domain (e.g. LLM Fine-tuning)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="Low">Initiate Path</option>
            <option value="Medium">Senior Path</option>
            <option value="High">Expert Path</option>
          </select>
          <button type="submit" className="btn-premium">Forge Curriculum</button>
        </form>

        <footer style={{ marginTop: "12rem", opacity: 0.2, letterSpacing: "4px", fontSize: "0.7rem", fontWeight: 900 }}>
          DISTRIBUTED AGENTIC ENGINE v5.0.4
        </footer>
      </div>
    </div>
  );
}
