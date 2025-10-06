 // src/pages/ModeloCusto.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
   
// Detecta base da API (proxy no dev, domínio no prod)
const API_BASE =
  location.hostname === "localhost" || location.hostname.startsWith("127.")
    ? "/api/webhook"
    : "https://webhook.lglducci.com.br/webhook";

const isHTML = (ct, raw) =>
  (ct || "").includes("text/html") || (raw || "").startsWith("<!DOCTYPE");

export default function ModeloCusto() {
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // empresa no localStorage
        let empresa;
        try {
          empresa = JSON.parse(localStorage.getItem("empresa"));
        } catch {}
        if (!empresa?.id_empresa) {
          empresa = { id_empresa: 2 };
          localStorage.setItem("empresa", JSON.stringify(empresa));
        }

        const url = `${API_BASE}/modelos_custo?id_empresa=${empresa.id_empresa}`;
        const r = await fetch(url, { cache: "no-store" });
        const ct = r.headers.get("content-type") || "";
        const raw = await r.text();

        if (!r.ok || isHTML(ct, raw)) {
          setMsg("Servidor respondeu HTML ou erro. Exibindo tabela vazia.");
          setModelos([]);
          return;
        }

        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          setModelos(data);
        } else {
          setMsg("JSON inválido.");
          setModelos([]);
        }
      } catch (e) {
        setMsg("Falha ao carregar modelos.");
        setModelos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const salvar = async () => {
    try {
      setSalvando(true);
      let empresa;
      try {
        empresa = JSON.parse(localStorage.getItem("empresa"));
      } catch {}
      if (!empresa?.id_empresa) throw new Error("Empresa não encontrada.");

      const url = `${API_BASE}/modelos_custo`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_empresa: empresa.id_empresa, modelos }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      alert("✅ Modelos salvos!");
      navigate(-1);
    } catch (e) {
      alert("❌ Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        ⏳ Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-xl border border-orange-500 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-orange-400">💰 Modelos de Custo</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg"
            >
              ⬅️ Voltar
            </button>
            <button
              onClick={salvar}
              disabled={salvando}
              className={`px-4 py-2 rounded-lg font-semibold text-white ${
                salvando ? "bg-orange-400" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {salvando ? "Salvando..." : "💾 Salvar"}
            </button>
          </div>
        </div>

        {msg && (
          <div className="mb-3 text-sm text-yellow-300 bg-yellow-900/30 border border-yellow-700 rounded p-2">
            {msg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-orange-400 border-b border-orange-500">
                <th className="p-2">Grupo</th>
                <th className="p-2">Descrição</th>
                <th className="p-2 text-center">Margem Mínima</th>
                <th className="p-2 text-center">Margem Máxima</th>
              </tr>
            </thead>
            <tbody>
              {modelos.map((m, i) => (
                <tr key={m.id_referencia ?? i} className="border-b border-gray-700">
                  <td className="p-2 font-semibold text-orange-300">{m.nome_grupo}</td>
                  <td className="p-2 text-sm text-gray-300">{m.descricao}</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={m.margem_min ?? 0}
                      step="0.01"
                      className="w-24 bg-gray-900 text-center border border-gray-600 rounded p-1"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setModelos((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, margem_min: val } : x))
                        );
                      }}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={m.margem_max ?? 0}
                      step="0.01"
                      className="w-24 bg-gray-900 text-center border border-gray-600 rounded p-1"
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
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    ⚠️ Nenhum modelo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
