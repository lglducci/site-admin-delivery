// src/pages/KpiTermometroDia.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Detecta base da API (proxy no dev, domínio no prod)
const API_BASE =
  location.hostname === "localhost" || location.hostname.startsWith("127.")
    ? "/api/webhook"
    : "https://webhook.lglducci.com.br/webhook";

// helpers
const fmtBRL = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const todayStr = () => {
  const d = new Date();
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

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
  return null;
}

const isHTML = (ct, raw) =>
  (ct || "").includes("text/html") || (raw || "").startsWith("<!DOCTYPE");

export default function KpiTermometroDia() {
  const navigate = useNavigate();

  // filtros
  const [dataRef, setDataRef] = useState(todayStr());
  const [taxa, setTaxa] = useState("3.00");

  // estado
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const idEmpresa = useMemo(() => getIdEmpresaSafe() ?? 1, []);

  async function carregar() {
    try {
      setLoading(true);
      setMsg("");

      // mando taxa com os dois nomes pra garantir compatibilidade
      const url =
        `${API_BASE}/kpi_termometro_dia` +
        `?id_empresa=${idEmpresa}&data=${encodeURIComponent(dataRef)}` +
        `&taxa=${encodeURIComponent(taxa)}&taxa_entrega=${encodeURIComponent(taxa)}`;

      const r = await fetch(url, { cache: "no-store" });
      const ct = r.headers.get("content-type") || "";
      const raw = await r.text();

      if (!r.ok || isHTML(ct, raw)) {
        setMsg("Servidor respondeu HTML/erro. Tente novamente.");
        setKpi(null);
        return;
      }

      const json = JSON.parse(raw);
      // pode vir {kpi_termometro_dia: {...}} ou direto {...}
      const payload = json?.kpi_termometro_dia ?? json ?? null;
      setKpi(payload);
      if (!payload) setMsg("Sem dados para esse dia.");
    } catch (e) {
      setMsg("Falha ao carregar KPI.");
      setKpi(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEmpresa]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-xl border border-orange-500 p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <h1 className="text-2xl font-bold text-orange-400">📊 Termômetro do Dia</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg"
            >
              ⬅️ Voltar
            </button>
            <button
              onClick={carregar}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
            >
              🔄 Recarregar
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <div className="col-span-1">
            <label className="block text-sm text-gray-300 mb-1">Empresa</label>
            <input
              value={idEmpresa}
              disabled
              className="w-full bg-gray-900 border border-gray-700 rounded p-2"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm text-gray-300 mb-1">Data</label>
            <input
              type="date"
              value={dataRef}
              onChange={(e) => setDataRef(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm text-gray-300 mb-1">Taxa por Entrega (R$)</label>
            <input
              type="number"
              step="0.01"
              value={taxa}
              onChange={(e) => setTaxa(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2"
            />
          </div>

          <div className="col-span-1 flex items-end">
            <button
              onClick={carregar}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
            >
              Aplicar filtros
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-black/40 border border-orange-500 rounded p-4 text-center">
            ⏳ Carregando...
          </div>
        )}

        {msg && !loading && (
          <div className="bg-yellow-900/40 border border-yellow-600 rounded p-3 mb-4 text-yellow-300">
            {msg}
          </div>
        )}

        {/* KPIs */}
        {kpi && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard titulo="Pedidos" valor={kpi.pedidos} />
              <KpiCard titulo="Receita Bruta" valor={fmtBRL(kpi.receita_bruta)} />
              <KpiCard
                titulo="Taxa de Entrega (total)"
                valor={`${fmtBRL(kpi.entrega_taxa_total)} (R$ ${Number(kpi.entrega_taxa_unit || 0).toFixed(2)} x ${kpi.entrega_qtd || 0})`}
              />
              <KpiCard titulo="Receita Líquida" valor={fmtBRL(kpi.receita_liquida)} />
              <KpiCard titulo="Ticket Médio Líquido" valor={fmtBRL(kpi.ticket_medio_liquido)} />
              <KpiCard titulo="Entrega" valor={kpi.entrega_qtd} />
              <KpiCard titulo="Retirada" valor={kpi.retirada_qtd} />
              <KpiCard titulo="Pedido Máx" valor={fmtBRL(kpi.pedido_max)} />
              <KpiCard titulo="Pedido Mín" valor={fmtBRL(kpi.pedido_min)} />
              <KpiCard titulo="Item Máx" valor={fmtBRL(kpi.item_max)} />
              <KpiCard titulo="Item Mín" valor={fmtBRL(kpi.item_min)} />
              {typeof kpi.itens_sem_modelo === "number" && (
                <KpiCard
                  titulo="Itens sem Modelo"
                  valor={kpi.itens_sem_modelo}
                  destaque="⚠️"
                />
              )}
            </div>

            {/* Margem estimada (se vier) */}
            {kpi.margem_estimada && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <KpiCard titulo="Receita (itens)" valor={fmtBRL(kpi.margem_estimada.receita_itens)} />
                <KpiCard titulo="Custo Estimado" valor={fmtBRL(kpi.margem_estimada.custo_estimado)} />
                <KpiCard titulo="Margem Estimada" valor={fmtBRL(kpi.margem_estimada.margem_estimada)} />
              </div>
            )}

            {/* Tabelas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl border border-orange-500 p-4">
                <h2 className="text-lg font-semibold text-orange-400 mb-3">Vendas por Hora</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-orange-300 border-b border-gray-700">
                        <th className="p-2">Hora</th>
                        <th className="p-2">Pedidos</th>
                        <th className="p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(kpi.vendas_hora || []).map((h, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="p-2">{String(h.hora).padStart(2, "0")}:00</td>
                          <td className="p-2">{h.pedidos}</td>
                          <td className="p-2">{fmtBRL(h.total)}</td>
                        </tr>
                      ))}
                      {!kpi.vendas_hora?.length && (
                        <tr><td className="p-3 text-gray-400" colSpan={3}>Sem movimento.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-orange-500 p-4">
                <h2 className="text-lg font-semibold text-orange-400 mb-3">Top Itens do Dia</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-orange-300 border-b border-gray-700">
                        <th className="p-2">Item</th>
                        <th className="p-2">Qtd</th>
                        <th className="p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(kpi.top_itens || []).map((t, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="p-2">{t.nome}</td>
                          <td className="p-2">{t.qtd}</td>
                          <td className="p-2">{fmtBRL(t.total)}</td>
                        </tr>
                      ))}
                      {!kpi.top_itens?.length && (
                        <tr><td className="p-3 text-gray-400" colSpan={3}>Sem dados.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Observações */}
            {kpi.observacoes && (
              <div className="mt-6 text-sm text-gray-300 bg-gray-900 border border-gray-700 rounded p-3">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(kpi.observacoes, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({ titulo, valor, destaque }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
      <div className="text-sm text-gray-400">{titulo}</div>
      <div className="text-2xl font-bold mt-1">
        {destaque ? <span className="mr-1">{destaque}</span> : null}
        {valor}
      </div>
    </div>
  );
}
