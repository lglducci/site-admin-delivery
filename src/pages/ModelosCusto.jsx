 // src/pages/ModelosCusto.jsx
import React, { useEffect, useState } from "react";

export default function ModelosCusto() {
  const [msg, setMsg] = useState("🟡 Iniciando...");
  const [modelos, setModelos] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setMsg("🧩 Componente montou.");

        // garante empresa
        let empresa = null;
        try { empresa = JSON.parse(localStorage.getItem("empresa")); } catch {}
        if (!empresa || !empresa.id_empresa) {
          empresa = { id_empresa: 2 };
          localStorage.setItem("empresa", JSON.stringify(empresa));
        }
        setMsg((m) => m + `\n🏢 id_empresa=${empresa.id_empresa}`);

        // usa o PROXY do Vite (vite.config.js)
        const url = `/api/webhook/modelos_custo?id_empresa=${empresa.id_empresa}`;
        setMsg((m) => m + `\n📡 GET ${url}`);
        const r = await fetch(url);
        const raw = await r.text();
        setMsg((m) => m + `\n✅ Resposta bruta (1k):\n${raw.slice(0, 1000)}`);

        let data = [];
        try { data = JSON.parse(raw); } catch {}
        if (Array.isArray(data)) {
          setModelos(data);
          setMsg((m) => m + `\n📦 itens=${data.length}`);
        } else {
          setMsg((m) => m + `\n⚠️ JSON inválido. Tabela vazia.`);
          setModelos([]);
        }
      } catch (e) {
        setMsg((m) => m + `\n❌ Erro: ${e.message}\n➡️ Usando fallback.`);
        setModelos([
          { id_referencia: 1, nome_grupo: "Tradicional", descricao: "Clássicas", margem_min: 0.45, margem_max: 0.55 },
          { id_referencia: 2, nome_grupo: "Premium", descricao: "Nobres", margem_min: 0.35, margem_max: 0.50 },
        ]);
      }
    })();
  }, []);

  const salvar = async () => {
    try {
      setSalvando(true);
      let empresa = null;
      try { empresa = JSON.parse(localStorage.getItem("empresa")); } catch {}
      if (!empresa || !empresa.id_empresa) empresa = { id_empresa: 2 };

      const url = `/api/webhook/modelos_custo`;
      setMsg((m) => m + `\n📡 POST ${url}`);
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_empresa: empresa.id_empresa, modelos }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      alert("✅ Modelos salvos com sucesso!");
    } catch (e) {
      alert("❌ Falha ao salvar: " + e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(#0b0b0b, #000)",
      color: "white", padding: 24, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        width: "100%", maxWidth: 1000, background: "#1f2937",
        borderRadius: 16, border: "1px solid #f97316", boxShadow: "0 10px 30px rgba(0,0,0,.5)", padding: 24
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h1 style={{ color: "#fb923c", fontSize: 22, fontWeight: 800 }}>💰 Modelos de Custo</h1>
          <button onClick={() => window.location.reload()} style={{
            background: "#374151", border: 0, padding: "8px 12px",
            borderRadius: 10, color: "white", cursor: "pointer"
          }}>🔄 Recarregar</button>
        </div>

        {/* LOG VISÍVEL */}
        <pre style={{
          background: "#111827", padding: 12, borderRadius: 10, maxHeight: 180,
          overflow: "auto", whiteSpace: "pre-wrap", marginBottom: 16, border: "1px solid #374151"
        }}>{msg}</pre>

        {/* TABELA */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#fb923c", borderBottom: "1px solid #f97316" }}>
                <th style={{ padding: 8, textAlign: "left" }}>Grupo</th>
                <th style={{ padding: 8, textAlign: "left" }}>Descrição</th>
                <th style={{ padding: 8, textAlign: "center" }}>Margem Mínima</th>
                <th style={{ padding: 8, textAlign: "center" }}>Margem Máxima</th>
              </tr>
            </thead>
            <tbody>
              {modelos.map((m, i) => (
                <tr key={m.id_referencia ?? i} style={{ borderBottom: "1px solid #374151" }}>
                  <td style={{ padding: 8, color: "#fdba74", fontWeight: 600 }}>{m.nome_grupo}</td>
                  <td style={{ padding: 8, color: "#d1d5db", fontSize: 14 }}>{m.descricao}</td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <input type="number" value={m.margem_min} step="0.01"
                      style={{ width: 90, background: "#0f172a", color: "white",
                        border: "1px solid #4b5563", borderRadius: 8, padding: 6, textAlign: "center" }}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setModelos((prev) => prev.map((x, j) => (j === i ? { ...x, margem_min: val } : x)));
                      }}
                    />
                  </td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <input type="number" value={m.margem_max} step="0.01"
                      style={{ width: 90, background: "#0f172a", color: "white",
                        border: "1px solid #4b5563", borderRadius: 8, padding: 6, textAlign: "center" }}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setModelos((prev) => prev.map((x, j) => (j === i ? { ...x, margem_max: val } : x)));
                      }}
                    />
                  </td>
                </tr>
              ))}
              {modelos.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 16, textAlign: "center", color: "#9ca3af" }}>
                    ⚠️ Nenhum modelo carregado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 12 }}>
          <button onClick={salvar} disabled={salvando} style={{
            background: salvando ? "#b45309" : "#ea580c", border: 0, padding: "10px 16px",
            borderRadius: 10, color: "white", cursor: "pointer", fontWeight: 700
          }}>
            {salvando ? "Salvando..." : "💾 Salvar e Sair"}
          </button>
        </div>
      </div>
    </div>
  );
}
