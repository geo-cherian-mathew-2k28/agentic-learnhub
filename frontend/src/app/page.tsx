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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
          <main style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="video-frame">
              <div className="corner-decor top-left"></div>
              <div className="corner-decor bottom-right"></div>
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
              <h1 className="content-title">
                {current.title}
              </h1>

              <div className="glass-card">
                <p className="content-summary">
                  <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>Brief: </span>
                  {current.summary}
                </p>
              </div>
            </div>
          </main>

          {/* Side Panels */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="panel quiz-container">
              <h3 className="section-header">Knowledge Check</h3>
              {current.questions && current.questions.length > 0 ? (
                <>
                  <p className="quiz-q">{current.questions[0].question}</p>
                  <div className="quiz-grid">
                    {current.questions[0].options.map((opt, j) => {
                      const correctIdx = current.questions[0]?.correct_index;
                      const isSelected = selectedOpt === j;
                      const statusClass = isSelected
                        ? (isCorrect ? 'correct' : 'error')
                        : (isCorrect === false && j === correctIdx ? 'correct' : '');

                      return (
                        <button
                          key={j}
                          className={`quiz-opt ${statusClass}`}
                          onClick={() => handleOptionSelect(j)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>Loading...</p>
              )}
            </div>

            {activeStep < path.path.length - 1 && (
              <button
                className="btn-premium action-btn"
                onClick={() => { setActiveStep(activeStep + 1); window.scrollTo(0, 0); }}
              >
                Next ❯
              </button>
            )}

            {activeStep === path.path.length - 1 && isCorrect === true && (
              <div className="panel completed-badge">
                <span>★ Module Completed</span>
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

          <div className="custom-select" style={{ position: "relative" }}>
            <button
              type="button"
              className="select-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {level === "Low" ? "Beginner" : level === "Medium" ? "Intermediate" : "Expert"}
              <span className={`arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isDropdownOpen && (
              <div className="select-options">
                {[
                  { val: "Low", label: "Beginner" },
                  { val: "Medium", label: "Intermediate" },
                  { val: "High", label: "Expert" }
                ].map((opt) => (
                  <div
                    key={opt.val}
                    className={`select-option ${level === opt.val ? "selected" : ""}`}
                    onClick={() => { setLevel(opt.val); setIsDropdownOpen(false); }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-premium">Start</button>
        </form>

        <div className="trending-section animate" style={{ animationDelay: "0.1s" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Popular Learning Paths</p>
          <div className="trending-tags">
            {["System Design", "React Advanced", "Python AI", "Docker", "Next.js 14", "Kubernetes"].map((tag) => (
              <span key={tag} onClick={() => setTopic(tag)} className="trend-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
