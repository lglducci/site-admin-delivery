 import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  location.hostname === "localhost" || location.hostname.startsWith("127.")
    ? "/api/webhook"
    : "https://webhook.lglducci.com.br/webhook";

const isHTML = (ct, raw) =>
  (ct || "").includes("text/html") || (raw || "").startsWith("<!DOCTYPE");

export default function Relatorios() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const emp = JSON.parse(localStorage.getItem("empresa") || "{}");
        const id = emp?.id_empresa ?? 2; // fallback
        const url = `${API_BASE}/relatorios?id_empresa=${id}`;
        const r = await fetch(url, { cache: "no-store" });
        const ct = r.headers.get("content-type") || "";
        const raw = await r.text();

        if (!r.ok || isHTML(ct, raw)) {
          setMsg("Servidor devolveu HTML/erro. Mostrando lista vazia.");
          setRows([]);
          return;
        }
        const data = JSON.parse(raw);
        const arr = Array.isArray(data) ? data.filter(x => (x.ativo ?? 1) !== 0) : [];
        setRows(arr);
      } catch (e) {
        setMsg("Falha ao carregar relatórios.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grupos = useMemo(() => {
    const f = (q || "").trim().toLowerCase();
    const list = !f
      ? rows
      : rows.filter(r =>
          (r.relatorio || "").toLowerCase().includes(f) ||
          (r.grupo || "").toLowerCase().includes(f)
        );

    const map = new Map();
    for (const r of list) {
      const g = (r.grupo || "Geral").toString();
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(r);
    }
    // ordena itens por ordem, depois por nome
    for (const [g, arr] of map) {
      arr.sort(
        (a, b) =>
          (a.ordem ?? 0) - (b.ordem ?? 0) ||
          (a.relatorio || "").localeCompare(b.relatorio || "")
      );
    }
    // ordena grupos alfabeticamente
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([g, items]) => ({ grupo: g, items }));
  }, [rows, q]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        ⏳ Carregando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl border border-orange-500 shadow p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold text-orange-400">📊 Relatórios</h1>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou grupo…"
            className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm w-72"
          />
        </div>

        {msg && (
          <div className="mb-3 text-sm text-yellow-300 bg-yellow-900/30 border border-yellow-700 rounded p-2">
            {msg}
          </div>
        )}

        {grupos.length === 0 && (
          <div className="p-8 text-center text-gray-400">Nenhum relatório encontrado.</div>
        )}

        {grupos.map(({ grupo, items }) => (
          <div key={grupo} className="mb-6">
            <div className="text-lg font-semibold text-orange-300 border-b border-orange-500 pb-1 mb-3">
              {grupo}
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-orange-400 border-b border-gray-700">
                  <th className="p-2 w-16">ID</th>
                  <th className="p-2">Relatório</th>
                  <th className="p-2 w-40 text-center">Abrir</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b border-gray-700">
                    <td className="p-2 text-gray-300">{r.id}</td>
                    <td className="p-2">{r.relatorio}</td>
                    <td className="p-2 text-center">
                      {r?.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline text-orange-300 hover:text-orange-200"
                        >
                          Abrir ↗
                        </a>
                      ) : (
                        <button
                          onClick={() => nav(r.rota || "/relatorios")}
                          className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded"
                        >
                          Abrir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
