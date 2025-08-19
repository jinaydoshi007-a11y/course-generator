"use client";

import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [duration, setDuration] = useState("1 week");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);

  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);

  // Generate course
  const handleGenerateCourse = async () => {
    setLoading(true);
    setCourse("");
    setQuiz(null);
    setScore(null);

    const res = await fetch("/api/generate-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, level, duration }),
    });

    const data = await res.json();
    setCourse(data.course || "Error generating course");
    setLoading(false);
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setQuiz(null);
    setUserAnswers({});
    setScore(null);

    const res = await fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course }),
    });

    const data = await res.json();
    setQuiz(data.quiz || []);
    setQuizLoading(false);
  };

  // Handle selecting an answer
  const handleAnswerSelect = (qIndex, option) => {
    setUserAnswers({ ...userAnswers, [qIndex]: option });
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (userAnswers[i] === q.answer) {
        correct++;
      }
    });
    setScore(`${correct} / ${quiz.length}`);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>📘 AI Course Generator</h1>

      {/* Course Form */}
      <div>
        <input
          type="text"
          placeholder="Enter a topic (e.g., Division)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ margin: "5px", padding: "5px" }}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input
          type="text"
          placeholder="Duration (e.g., 1 week)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          style={{ margin: "5px", padding: "5px" }}
        />
        <button onClick={handleGenerateCourse} disabled={loading}>
          {loading ? "Generating..." : "Generate Course"}
        </button>
      </div>

      {/* Show Course */}
      {course && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Course:</h2>
          <p>{course}</p>
          <button onClick={handleGenerateQuiz} disabled={quizLoading}>
            {quizLoading ? "Generating Quiz..." : "Take a Quiz"}
          </button>
        </div>
      )}

      {/* Show Quiz */}
      {quiz && quiz.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Quiz</h2>
          {quiz.map((q, i) => (
            <div key={i} style={{ marginBottom: "15px" }}>
              <p><b>Q{i + 1}:</b> {q.question}</p>
              {q.options.map((opt, j) => (
                <label key={j} style={{ display: "block" }}>
                  <input
                    type="radio"
                    name={`question-${i}`}
                    value={opt}
                    checked={userAnswers[i] === opt}
                    onChange={() => handleAnswerSelect(i, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}

          <button onClick={handleSubmitQuiz}>Submit Quiz</button>

          {score && (
            <div style={{ marginTop: "10px" }}>
              <h3>Your Score: {score}</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
