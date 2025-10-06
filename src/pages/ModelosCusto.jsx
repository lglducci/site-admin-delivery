 // src/pages/ModelosCusto.jsx
import React, { useEffect, useState } from "react";

const MOCK = [
  { id_referencia: 1, nome_grupo: "Tradicional", descricao: "Clássicas com bom giro", margem_min: 0.45, margem_max: 0.55 },
  { id_referencia: 2, nome_grupo: "Premium", descricao: "Ingredientes nobres/importados", margem_min: 0.35, margem_max: 0.50 },
  { id_referencia: 3, nome_grupo: "Promo", descricao: "Ofertas da semana", margem_min: 0.30, margem_max: 0.40 },
];

const detectHTML = (ct, raw) => (ct || "").includes("text/html") || raw?.startsWith("<!DOCTYPE html");

export default function ModelosCusto() {
  const [modelos, setModelos] = useState(MOCK);
  const [status, setStatus] = useState("offline"); // offline | online
  const [msg, setMsg] = useState("Trabalhando com dados locais.");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      // garante empresa
      let empresa;
      try { empresa = JSON.parse(localStorage.getItem("empresa")); } catch {}
      if (!empresa?.id_empresa) {
        empresa = { id_empresa: 2 };
        localStorage.setItem("empresa", JSON.stringify(empresa));
      }

      // tenta PROD -> TESTE; se vier HTML, fica offline (usa MOCK)
      try {
        const tryFetch = async (url) => {
          const r = await fetch(url);
          const ct = r.headers.get("content-type") || "";
          const raw = await r.text();
          if (detectHTML(ct, raw)) return null;
          try { return JSON.parse(raw); } catch { return null; }
        };

        let data =
          (await tryFetch(`/api/webhook/modelos_custo?id_empresa=${empresa.id_empresa}`)) ||
          (await tryFetch(`/api/n8n/modelos_custo?id_empresa=${empresa.id_empresa}`));

        if (Array.isArray(data) && data.length) {
          setModelos(data);
          setStatus("online");
          setMsg("Conectado ao servidor.");
        } else {
          setStatus("offline");
          setMsg("Servidor indisponível. Usando dados locais.");
        }
      } catch {
        setStatus("offline");
        setMsg("Servidor indisponível. Usando dados locais.");
      }
    })();
  }, []);

  const salvar = async () => {
    setSalvando(true);
    try {
      let empresa;
      try { empresa = JSON.parse(localStorage.getItem("empresa")); } catch {}
      if (!empresa?.id_empresa) empresa = { id_empresa: 2 };

      // tenta enviar ao servidor (PROD → TESTE)
      const tryPost = async (url) => {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_empresa: empresa.id_empresa, modelos }),
        });
        const ct = r.headers.get("content-type") || "";
        const raw = await r.text();
        if (!r.ok || detectHTML(ct, raw)) throw new Error("Servidor não aceitou");
      };

      await tryPost("/api/webhook/modelos_custo").catch(() => tryPost("/api/n8n/modelos_custo"));
      alert("✅ Modelos salvos no servidor!");
    } catch {
      // fallback local
      localStorage.setItem("modelos_custo_draft", JSON.stringify(modelos));
      alert("⚠️ Sem conexão. Alterações salvas LOCALMENTE. (modelos_custo_draft)");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl border border-orange-500 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-orange-400">💰 Modelos de Custo</h1>
          <span
            className={`px-3 py-1 rounded-lg text-sm ${
              status === "online" ? "bg-green-700/40 text-green-300" : "bg-yellow-700/40 text-yellow-300"
            }`}
            title={msg}
          >
            {status === "online" ? "ONLINE" : "OFFLINE"}
          </span>
        </div>

        <p className="text-sm text-gray-300 mb-4">{msg}</p>

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
                <tr key={m.id_referencia ?? i} className="border-b border-gray-700 hover:bg-gray-700/40 transition">
                  <td className="p-2 font-semibold text-orange-300">{m.nome_grupo}</td>
                  <td className="p-2 text-sm text-gray-300">{m.descricao}</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={m.margem_min ?? 0}
                      step="0.01"
                      className="w-24 bg-gray-900 text-center border border-gray-600 rounded p-1 focus:outline-none"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setModelos((prev) => prev.map((x, j) => (j === i ? { ...x, margem_min: val } : x)));
                      }}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={m.margem_max ?? 0}
                      step="0.01"
                      className="w-24 bg-gray-900 text-center border border-gray-600 rounded p-1 focus:outline-none"
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
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    ⚠️ Nenhum modelo carregado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            🔄 Recarregar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className={`px-6 py-2 rounded-lg font-semibold text-white shadow-lg transition ${
              salvando ? "bg-orange-400" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {salvando ? "Salvando..." : "💾 Salvar e Sair"}
          </button>
        </div>
      </div>
    </div>
  );
}
