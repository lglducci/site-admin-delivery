 // src/pages/Relatorios.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  location.hostname === "localhost" || location.hostname.startsWith("127.")
    ? "/api/webhook"
    : "https://webhook.lglducci.com.br/webhook";

function getIdEmpresaSafe() {
  try {
    const direto = localStorage.getItem("id_empresa");
    if (direto && !Number.isNaN(Number(direto))) return Number(direto);
    const raw = localStorage.getItem("empresa");
    if (raw) {
      const obj = JSON.parse(raw);
      const n = Number(obj?.id_empresa ?? obj?.idEmpresa);
      if (!Number.isNaN(n)) return n;
    }
  } catch {}
  return 1;
}

export default function Relatorios() {
  const navigate = useNavigate();
  const idEmpresa = useMemo(() => getIdEmpresaSafe(), []);
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 FUNÇÃO QUE ABRE O RELATÓRIO
  function abrirRelatorio(r) {
    // 1) se tiver URL absoluta, abre em nova aba
    if (r.url && /^https?:\/\//i.test(r.url)) {
      window.open(r.url, "_blank");
      return;
    }
    // 2) se tiver rota interna, navega
    if (r.rota) {
      const rota = r.rota.startsWith("/") ? r.rota : `/${r.rota}`;
      navigate(rota);
      return;
    }
    alert("Este relatório ainda não tem rota/url configurada.");
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`${API_BASE}/relatorios?id_empresa=${idEmpresa}`, { cache: "no-store" });
        const data = await r.json();
        setLista(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, [idEmpresa]);

  const grupos = useMemo(() => {
    const by = {};
    (lista || [])
      .filter((x) => {
        const q = filtro.trim().toLowerCase();
        if (!q) return true;
        return (
          String(x.relatorio || "").toLowerCase().includes(q) ||
          String(x.grupo || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.grupo || "").localeCompare(b.grupo || "") || (a.ordem || 0) - (b.ordem || 0))
      .forEach((r) => {
        const g = r.grupo || "Outros";
        by[g] = by[g] || [];
        by[g].push(r);
      });
    return by;
  }, [lista, filtro]);

  return (
    
 
      
        <div className="min-h-screen text-white p-6 bg-[#06283c]">
       <div className="max-w-5xl mx-auto bg-[#012e46] rounded-2xl shadow-xl border border-[#ffffff]/60 p-6">

       
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-orange-400">📈 Relatórios</h1>
          <input
            placeholder="Buscar por nome ou grupo..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 w-64"
          />
        </div>

        {loading && <div className="p-4 bg-black/40 border border-gray-700 rounded">⏳ Carregando...</div>}

        {!loading &&
          Object.keys(grupos).map((g) => (
            <div key={g} className="mb-6">
              <div className="text-orange-300 font-semibold mb-2 border-b border-orange-500 pb-1">{g}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-orange-300 border-b border-gray-700">
                      <th className="p-2 w-16">ID</th>
                      <th className="p-2">Relatório</th>
                      <th className="p-2 w-32 text-right">Abrir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupos[g].map((r) => (
                      <tr key={r.id} className="border-b border-gray-800">
                        <td className="p-2">{r.id}</td>
                        <td className="p-2">{r.relatorio}</td>
                        <td className="p-2 text-right">
                          {/* 🔸 BOTÃO QUE CHAMA A FUNÇÃO */}
                          <button
                            onClick={() => abrirRelatorio(r)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded"
                          >
                            Abrir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!grupos[g].length && (
                      <tr>
                        <td className="p-3 text-gray-400" colSpan={3}>
                          Nenhum relatório.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
