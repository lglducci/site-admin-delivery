 // src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    // log opcional
    console.error("ErrorBoundary capturou:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: "black", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }}>
          <div style={{
            width: "100%", maxWidth: 900, background: "#1f2937",
            border: "1px solid #ef4444", borderRadius: 16, padding: 20
          }}>
            <h1 style={{ color: "#fca5a5", marginBottom: 8 }}>💥 Erro na página</h1>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {String(this.state.err?.message || this.state.err)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 12, background: "#ef4444", color: "white",
                border: 0, padding: "8px 12px", borderRadius: 8, cursor: "pointer"
              }}
            >
              🔄 Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
