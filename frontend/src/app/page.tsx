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
        <header className="top-nav">
          <div className="logo-text">LearnLens</div>
          <button className="btn-premium" onClick={() => setPath(null)}>New Search</button>
        </header>

        <section className="master-grid">
          {/* Roadmap */}
          <aside className="curriculum-pills">
            <h3 style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.75rem" }}>Curriculum</h3>
            {path.path.map((step, i) => (
              <div
                key={i}
                className={`pill ${activeStep === i ? 'active' : ''}`}
                onClick={() => setActiveStep(i)}
              >
                <div className="pill-meta">Module {i + 1}</div>
                <div className="pill-title">{step.step_name}</div>
              </div>
            ))}
          </aside>

          {/* Main Feed */}
          <main style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
              <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.25rem" }}>
                {current.title}
              </h1>
              <p style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1.5rem" }}>{current.channel}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                <div className="panel">
                  <h4 className="pill-meta">Summary</h4>
                  <p style={{ fontSize: "1rem", lineHeight: 1.5, color: "var(--text-primary)", opacity: 0.9 }}>{current.summary}</p>
                </div>

                <div className="panel" style={{ borderLeft: "3px solid var(--accent-secondary)" }}>
                  <h4 className="pill-meta" style={{ color: "var(--accent-secondary)" }}>Core Concept</h4>
                  <p style={{ fontSize: "0.95rem", fontWeight: 500 }}>{current.mental_model}</p>
                </div>
              </div>
            </div>
          </main>

          {/* Side Panels */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="panel">
              <h3 className="pill-meta" style={{ color: "var(--accent-success)", marginBottom: "1rem" }}>Prerequisites</h3>
              {current.checklist.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  <span style={{ color: "var(--accent-success)" }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="panel" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
              <h3 className="pill-meta" style={{ color: "var(--accent-gold)", marginBottom: "1rem" }}>Quiz</h3>
              {current.questions && current.questions.length > 0 ? (
                <>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", lineHeight: 1.4 }}>{current.questions[0].question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {current.questions[0].options.map((opt, j) => {
                      const correctIdx = current.questions[0]?.correct_index;
                      return (
                        <button
                          key={j}
                          className={`mcq-button ${selectedOpt === j ? (isCorrect ? 'correct' : 'error') : ''} ${isCorrect === false && j === correctIdx ? 'correct' : ''}`}
                          onClick={() => handleOptionSelect(j)}
                        >
                          <span style={{ maxWidth: "85%" }}>{opt}</span>
                          <span>
                            {selectedOpt === j ? (isCorrect ? '✓' : '✗') : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {isCorrect !== null && (
                    <div className="animate" style={{ marginTop: "1rem", textAlign: "center", padding: "0.75rem", borderRadius: "8px", background: isCorrect ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)" }}>
                      <p style={{ fontWeight: 700, color: isCorrect ? "var(--accent-success)" : "var(--accent-error)", fontSize: "0.8rem" }}>
                        {isCorrect ? "Correct!" : "Incorrect. Correct answer highlighted."}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Loading quiz...</p>
              )}
            </div>

            {activeStep < path.path.length - 1 && (
              <button
                className="btn-premium"
                style={{ width: "100%", padding: "1rem", borderRadius: "12px", fontSize: "1rem" }}
                onClick={() => { setActiveStep(activeStep + 1); window.scrollTo(0, 0); }}
              >
                Next Module →
              </button>
            )}

            {activeStep === path.path.length - 1 && isCorrect === true && (
              <div className="panel animate" style={{ background: "linear-gradient(135deg, var(--accent-success), #065f46)", color: "white", border: "none", textAlign: "center", padding: "1rem" }}>
                <h3 style={{ marginBottom: "0.25rem", fontWeight: 800, fontSize: "1rem" }}>Completed</h3>
                <p style={{ fontSize: "0.8rem", opacity: 0.9 }}>Module mastered.</p>
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
        <div className="logo-text" style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>LearnLens</div>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "4rem", fontWeight: 500 }}>
          Create a personalized learning path.
        </p>

        <form onSubmit={handleGenerate} className="search-hub animate">
          <input
            type="text"
            placeholder="Topic (e.g. React Patterns)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="Low">Beginner</option>
            <option value="Medium">Intermediate</option>
            <option value="High">Expert</option>
          </select>
          <button type="submit" className="btn-premium">Start</button>
        </form>
      </div>
    </div>
  );
}
