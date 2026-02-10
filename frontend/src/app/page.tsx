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
      if (!res.ok) throw new Error("Connection failed. Retrying...");
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
      <div className="hero-container animate">
        <div className="spinner" style={{ margin: "0 auto 1.5rem" }}></div>
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Orchestrating Knowledge...</h1>
      </div>
    );
  }

  if (path) {
    const current = path.path[activeStep];
    const correctIdx = current.questions[0]?.correct_index;

    return (
      <div className="platform-container animate">
        <header className="top-nav">
          <div className="logo-text">LearnLens</div>
          <button className="btn-premium" onClick={() => setPath(null)}>New Search</button>
        </header>

        <section className="master-grid">
          {/* Workspace */}
          <main className="main-content">
            <div className="video-container">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${current.id}?autoplay=1`}
                title="Workshop"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>

            <div className="video-meta">
              <h1 className="video-title">{current.title}</h1>
              <p className="channel-name">{current.channel}</p>

              <div className="summary-card">
                <p>{current.summary}</p>
              </div>
            </div>
          </main>

          {/* Quiz & Navigation */}
          <aside className="side-panel">
            <div className="panel progress-panel">
              <h3 className="section-label">Module {activeStep + 1} of {path.path.length}</h3>
              <div className="pill-container">
                {path.path.map((item, i) => (
                  <div
                    key={i}
                    className={`nav-pill ${activeStep === i ? 'active' : ''}`}
                    onClick={() => setActiveStep(i)}
                  >
                    <span>{i + 1}</span>
                    <span className="truncate">{item.step_name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel quiz-panel">
              <h3 className="section-label" style={{ color: "var(--accent-gold)" }}>Quick Quiz</h3>
              {current.questions && current.questions.length > 0 ? (
                <>
                  <p className="quiz-question">{current.questions[0].question}</p>
                  <div className="quiz-options">
                    {current.questions[0].options.map((opt, j) => (
                      <button
                        key={j}
                        className={`mcq-button ${selectedOpt === j ? (isCorrect ? 'correct' : 'error') : ''} ${isCorrect === false && j === correctIdx ? 'correct' : ''}`}
                        onClick={() => handleOptionSelect(j)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {isCorrect === true && <p className="feedback success">Correct!</p>}
                  {isCorrect === false && <p className="feedback error">Wrong. Correct answer highlighted.</p>}
                </>
              ) : <p>Loading quiz...</p>}
            </div>

            {activeStep < path.path.length - 1 && (
              <button
                className="btn-premium next-btn"
                onClick={() => { setActiveStep(activeStep + 1); window.scrollTo(0, 0); }}
              >
                Next Module →
              </button>
            )}
          </aside>
        </section>
      </div>
    );
  }

  return (
    <div className="hero-container">
      <div className="hero-content animate">
        <h1 className="logo-text main-logo">LearnLens AI</h1>
        <p className="hero-tagline">Precision Mastery Protocol</p>

        <form onSubmit={handleGenerate} className="search-box">
          <input
            type="text"
            placeholder="What do you want to master?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
          <div className="search-controls">
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="Low">Initiate</option>
              <option value="Medium">Senior</option>
              <option value="High">Expert</option>
            </select>
            <button type="submit" className="btn-premium">Forge Path</button>
          </div>
        </form>
      </div>
    </div>
  );
}
