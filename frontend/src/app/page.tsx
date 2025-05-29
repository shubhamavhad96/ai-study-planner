// src/pages/index.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

function useTypewriter(text: string, speed = 20) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

export default function HomePage() {
  const [goal, setGoal] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [daysAvailable, setDaysAvailable] = useState<string[]>([]);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day: string) => {
    setDaysAvailable(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const generatePlan = async () => {
    setLoading(true);
    setPlan(""); // Optionally clear previous plan while loading
    try {
      const res = await axios.post("http://localhost:4000/api/planner", {
        goal,
        hoursPerDay,
        daysAvailable,
      });
      setPlan(res.data.plan);
    } catch (err) {
      alert("Plan generation failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setGoal("");
    setHoursPerDay(1);
    setDaysAvailable([]);
    setPlan("");
  };

  const typedPlan = useTypewriter(plan, 15); // 15ms per character

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem",
        gap: "2rem",
      }}
    >
      {/* Left: Form */}
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
          padding: "2.5rem 2rem",
          maxWidth: "420px",
          width: "100%",
          minWidth: "320px",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "2rem",
            color: "#22223b",
            letterSpacing: "0.5px",
          }}
        >
          📘 AI Study Planner
        </h1>

        <div style={{ marginBottom: "1.2rem" }}>
          <label
            htmlFor="goal"
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "#22223b",
            }}
          >
            Your Goal
          </label>
          <input
            id="goal"
            placeholder="e.g. Learn TypeScript"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "1rem",
              outline: "none",
              marginBottom: "0.5rem",
              background: "#f8fafc",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.2rem" }}>
          <label
            htmlFor="hours"
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "#22223b",
            }}
          >
            Hours per day
          </label>
          <input
            id="hours"
            type="number"
            placeholder="Hours per day"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "1rem",
              outline: "none",
              background: "#f8fafc",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.2rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "#22223b",
            }}
          >
            Available Days
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {days.map(day => (
              <label
                key={day}
                style={{
                  background: daysAvailable.includes(day) ? "#4f8cff" : "#f1f5f9",
                  color: daysAvailable.includes(day) ? "#fff" : "#22223b",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "0.97rem",
                  userSelect: "none",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={daysAvailable.includes(day)}
                  onChange={() => toggleDay(day)}
                  style={{ display: "none" }}
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={generatePlan}
          style={{
            width: "100%",
            padding: "12px",
            background: "#4f8cff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1.1rem",
            cursor: "pointer",
            marginBottom: "1rem",
            boxShadow: "0 2px 8px rgba(79,140,255,0.08)",
            transition: "background 0.2s",
          }}
        >
          Generate Plan
        </button>
        <button
          onClick={clearAll}
          style={{
            width: "100%",
            padding: "12px",
            background: "#fff",
            color: "#4f8cff",
            border: "1px solid #4f8cff",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1.1rem",
            cursor: "pointer",
            marginBottom: "0",
            marginTop: "0.5rem",
            boxShadow: "0 2px 8px rgba(79,140,255,0.04)",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          Clear
        </button>
      </div>

      {/* Right: Plan Output */}
      {(loading || plan) && (
        <div
          style={{
            background: "#f1f5f9",
            borderRadius: "12px",
            padding: "1.5rem",
            fontSize: "1.08rem",
            color: "#22223b",
            whiteSpace: "pre-wrap",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            border: "1px solid #e0e7ef",
            width: "420px",
            height: "100%",
            overflowY: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%"
            }}>
              <div className="spinner" style={{
                width: "48px",
                height: "48px",
                border: "6px solid #e0e7ef",
                borderTop: "6px solid #4f8cff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              <style>
                {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
              </style>
            </div>
          ) : (
            <div style={{ width: "100%", alignSelf: "flex-start" }}>
              {typedPlan}
              {typedPlan.length < plan.length && (
                <span style={{ opacity: 0.5 }}>|</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
