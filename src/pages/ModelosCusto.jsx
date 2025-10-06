 // src/pages/ModelosCusto.jsx
import React, { useEffect, useState } from "react";

export default function ModelosCusto() {
  const [msg, setMsg] = useState("🟡 Iniciando...");
  const [modelos, setModelos] = useState([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setMsg("🧩 Componente montou (useEffect rodou).");
        // Prova visual
        setTimeout(() => alert("🟢 ModelosCusto montou!"), 50);

        // Garante empresa no localStorage
        let empresa = null;
        try {
          empresa = JSON.parse(localStorage.getItem("empresa"));
        } catch {}
        if (!empresa || !empresa.id_empresa) {
          empresa = { id_empresa: 2 };
          localStorage.setItem("empresa", JSON.stringify(empresa));
        }
        setMsg((m) => m + `\n🏢 id_empresa = ${empresa.id_empresa}`);

        const url = `/api/webhook/modelos_custo?id_empresa=${empresa.id_empresa}`;
        setMsg((m) => m + `\n📡 Chamando: ${url}`);

        const r = await fetch(url);
        const raw = await r.text();
        setMsg((m) => m + `\n✅ Resposta bruta:\n${raw.slice(0, 1000)}`);

        let data = [];
        try {
          data = JSON.parse(raw);
        } catch {
          setMsg((m) => m + "\n⚠️ Resposta não era JSON válido. Usando fallback.");
          data = [];
        }

        if (Array.isArray(data) && data.length > 0) {
          setModelos(data);
          setMsg((m) => m + `\n📦 Itens carregados: ${data.length}`);
        } else {
          setMsg((m) => m + "\n⚠️ Nenhum modelo retornado. Mostrando tabela vazia.");
          setModelos([]);
        }
      } catch (e) {
        setMsg((m) => m + `\n❌ Erro fatal: ${e.message}\nUsando dados mock.`);
        // fallback visível
        setModelos([
          {
            id_referencia: 1,
            nome_grupo: "Tradicional",
            descricao: "Pizzas clássicas",
            margem_min: 0.45,
            margem_max: 0.55,
          },
          {
            id_referencia: 2,
            nome_grupo: "Premium",
            descricao: "Ingredientes nobres",
            margem_min: 0.35,
            margem_max: 0.50,
          },
        ]);
      }
    })();
  }, []);

  const salvar = async () => {
    try {
      setSalvando(true);
      let empresa = null;
      try {
        empresa = JSON.parse(localStorage.getItem("empresa"));
      } catch {}
      if (!empresa || !empresa.id_empresa) empresa = { id_empresa: 2 };

      const r = await fetch(`/api/webhook/modelos_custo`, {
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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(#0b0b0b, #000)",
        color: "white",
        padding: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          background: "#1f2937",
          borderRadius: 16,
          border: "1px solid #f97316",
          boxShadow: "0 10px 30px rgba(0,0,0,.5)",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h1 style={{ color: "#fb923c", fontSize: 22, fontWeight: 800 }}>
            💰 Modelos de Custo
          </h1>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#374151",
              border: "none",
              padding: "8px 12px",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
            }}
          >
            🔄 Recarregar
          </button>
        </div>

        {/* Painel de diagnóstico visível */}
        <pre
          style={{
            background: "#111827",
            padding: 12,
            borderRadius: 10,
            maxHeight: 180,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            marginBottom: 16,
            border: "1px solid #374151",
          }}
        >
          {msg}
        </pre>

        {/* Tabela */}
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
                    <input
                      type="number"
                      value={m.margem_min}
                      step="0.01"
                      style={{
                        width: 90,
                        background: "#0f172a",
                        color: "white",
                        border: "1px solid #4b5563",
                        borderRadius: 8,
                        padding: 6,
                        textAlign: "center",
                      }}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setModelos((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, margem_min: val } : x))
                        );
                      }}
                    />
                  </td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <input
                      type="number"
                      value={m.margem_max}
                      step="0.01"
                      style={{
                        width: 90,
                        background: "#0f172a",
                        color: "white",
                        border: "1px solid #4b5563",
                        borderRadius: 8,
                        padding: 6,
                        textAlign: "center",
                      }}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setModelos((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, margem_max: val } : x))
                        );
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

        {/* Ações */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 12 }}>
          <button
            onClick={salvar}
            disabled={salvando}
            style={{
              background: salvando ? "#b45309" : "#ea580c",
              border: "none",
              padding: "10px 16px",
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {salvando ? "Salvando..." : "💾 Salvar e Sair"}
          </button>
        </div>
      </div>
    </div>
  );
}
