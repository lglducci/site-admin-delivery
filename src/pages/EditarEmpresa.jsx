import React, { useEffect, useState } from "react";

/* 🎨 Tema visual igual ao EditarItem */
const THEME = {
  pageBg: "#0e2a3a",
  cardBg: "#254759",
  cardBorder: "rgba(255,159,67,0.35)",
  cardShadow: "0 6px 20px rgba(0,0,0,0.25)",
  title: "#ff9f43",
  text: "#e8eef2",
  fieldBg: "#1f3b4d",
  fieldBorder: "rgba(255,159,67,0.25)",
  focusRing: "#ff9f43",
  btnPrimary: "#ff9f43",
  btnPrimaryText: "#1b1e25",
  btnSecondary: "#ef4444",
  btnSecondaryText: "#ffffff",
};

/* Helper para obter id_empresa */
function getIdEmpresa() {
  try {
    const raw = localStorage.getItem("empresa");
    if (raw) {
      const obj = JSON.parse(raw);
      return obj?.id_empresa || obj?.idEmpresa || 1;
    }
  } catch {}
  return 1;
}

export default function EditarEmpresa() {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarEmpresa() {
      const idEmpresa = getIdEmpresa();
      try {
        const r = await fetch(
          `https://webhook.lglducci.com.br/webhook/empresa?id_empresa=${idEmpresa}`
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        setEmpresa(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        console.error("Erro ao carregar empresa:", err);
      } finally {
        setLoading(false);
      }
    }
    carregarEmpresa();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setEmpresa((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSalvar() {
    if (!empresa) return;
    setSalvando(true);
    try {
      const resp = await fetch("https://webhook.lglducci.com.br/webhook/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresa),
      });
      if (resp.ok) {
        alert("✅ Empresa atualizada com sucesso!");
      } else {
        alert("❌ Erro ao salvar alterações.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Falha ao conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: THEME.pageBg, color: THEME.text }}
      >
        Carregando empresa…
      </div>
    );

  if (!empresa)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: THEME.pageBg, color: THEME.text }}
      >
        Empresa não encontrada.
      </div>
    );

  const fieldCls =
    "w-full px-3 py-2 rounded-xl focus:outline-none transition-shadow";
  const fieldStyle = {
    background: THEME.fieldBg,
    color: THEME.text,
    border: `1px solid ${THEME.fieldBorder}`,
  };
  const fieldFocus = { boxShadow: `0 0 0 2px ${THEME.focusRing}55` };

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: THEME.pageBg, color: THEME.text }}
    >
      <div
        className="w-full max-w-3xl mx-auto rounded-2xl p-8 border shadow-2xl"
        style={{
          background: THEME.cardBg,
          borderColor: THEME.cardBorder,
          boxShadow: THEME.cardShadow,
        }}
      >
        <h1
          className="text-2xl md:text-3xl font-bold mb-6 text-center"
          style={{ color: THEME.title }}
        >
          🏢 Editar Empresa
        </h1>

        <div className="space-y-4">
          {/* Nome (só exibe) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Nome</label>
            <input
              value={empresa.nome ?? ""}
              disabled
              className={fieldCls}
              style={{ ...fieldStyle, opacity: 0.8 }}
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-sm font-semibold mb-1">CNPJ</label>
            <input
              name="cnpj"
              value={empresa.cnpj ?? ""}
              onChange={handleChange}
              className={fieldCls}
              style={fieldStyle}
              onFocus={(e) => Object.assign(e.target.style, fieldFocus)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          {/* IE */}
          <div>
            <label className="block text-sm font-semibold mb-1">Inscrição Estadual (IE)</label>
            <input
              name="ie"
              value={empresa.ie ?? ""}
              onChange={handleChange}
              className={fieldCls}
              style={fieldStyle}
              onFocus={(e) => Object.assign(e.target.style, fieldFocus)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          {/* Saudação */}
          <div>
            <label className="block text-sm font-semibold mb-1">Saudação</label>
            <textarea
              name="saudacao"
              rows="5"
              value={empresa.saudacao ?? ""}
              onChange={handleChange}
              className={`${fieldCls} resize-none`}
              style={fieldStyle}
              onFocus={(e) => Object.assign(e.target.style, fieldFocus)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          {/* Taxa de entrega */}
          <div>
            <label className="block text-sm font-semibold mb-1">Taxa de Entrega (R$)</label>
            <input
              type="number"
              step="0.01"
              name="taxa_entrega"
              value={empresa.taxa_entrega ?? ""}
              onChange={handleChange}
              className={fieldCls}
              style={fieldStyle}
              onFocus={(e) => Object.assign(e.target.style, fieldFocus)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 rounded-xl shadow-md"
            style={{ background: THEME.btnSecondary, color: THEME.btnSecondaryText }}
          >
            🔙 Voltar
          </button>

          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="px-6 py-2 rounded-xl shadow-md"
            style={{
              background: salvando ? "#f1b97e" : THEME.btnPrimary,
              color: THEME.btnPrimaryText,
              opacity: salvando ? 0.8 : 1,
              cursor: salvando ? "not-allowed" : "pointer",
            }}
          >
            {salvando ? "Salvando..." : "💾 Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
