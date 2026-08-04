import { useEffect, useState } from "react";
import "./App.css";

type HealthResponse = {
  status: string;
  service: string;
  version: string;
};

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [version, setVersion] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch("http://127.0.0.1:8015/health");

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data: HealthResponse = await response.json();

        setBackendStatus(
          data.status === "healthy" ? "Connected" : "Unavailable",
        );
        setVersion(data.version);
      } catch {
        setBackendStatus("Disconnected");
      }
    }

    checkBackend();
  }, []);

  const isConnected = backendStatus === "Connected";

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://127.0.0.1:8015/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          model: "qwen3:1.7b",
        }),
      });

      const data = await res.json();

      setResponse(data.response);
    } catch {
      setResponse("Unable to connect to Kishore AI OS.");
    }

    setLoading(false);
  }

  return (
    <main className="app-shell">
      <section className="dashboard">
        <p className="eyebrow">LOCAL AI WORKSPACE</p>
        <h1>Kishore AI OS</h1>
        <p className="subtitle">
          Your private AI assistant powered by FastAPI, React, and Ollama.
        </p>

        <div className="status-grid">
          <article className="status-card">
            <span className={isConnected ? "dot online" : "dot offline"} />
            <div>
              <p className="label">Backend</p>
              <strong>{backendStatus}</strong>
            </div>
          </article>

          <article className="status-card">
            <span className="dot checking" />
            <div>
              <p className="label">Ollama</p>
              <strong>Coming next</strong>
            </div>
          </article>
        </div>

        <div className="chat-card">
          <h2>Ask Kishore AI OS</h2>
          <textarea
            placeholder="Ask Kishore AI OS anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
          {response && (
            <div className="response-card">
              <h3>AI Response</h3>
              <p>{response}</p>
            </div>
          )}
        </div>

        <p className="version">
          API version: {version || "Not available"}
        </p>
      </section>
    </main>
  );
}

export default App;