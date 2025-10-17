 // src/pages/KpiTermometroDia.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* 🎨 Tema azul coerente com Login/KDS */
const THEME = {
  // página
  pageBg: "#012e46",
  // painel/containers
  panelBg: "#153b54",
  panelBorder: "rgba(255,159,67,0.30)",
  // cards
  cardBg: "#254759",
  cardBorder: "rgba(255,159,67,0.30)",
  // tipografia e acentos
  title: "#ff9f43",
  text: "#e8eef2",
  textMuted: "#bac7cf",
  // inputs
  fieldBg: "#1f3b4d",
  fieldBorder: "rgba(255,159,67,0.25)",
  focusRing: "#ff9f43",
  // botões
  btnDark: "#2a2f39",
  btnDarkText: "#e5e7eb",
  btnOrange: "#ff9f43",
  btnOrangeText: "#1b1e25",
};

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

const C = (v) =>
  `R$ ${(Number(v || 0)).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function KpiTermometroDia() {
  const navigate = useNavigate();

  const [idEmpresa, setIdEmpresa] = useState(getIdEmpresaSafe());
  const [dataRef, setDataRef] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [taxaEntrega, setTaxaEntrega] = useState(3);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [kpi, setKpi] = useState({
    pedidos: 0,
    receita_bruta: 0,
    receita_liquida: 0,
    entrega_qtd: 0,
    retirada_qtd: 0,
    entrega_taxa_unit: 0,
    entrega_taxa_total: 0,
    ticket_medio_liquido: 0,
    pedido_max: 0,
    pedido_min: 0,
    item_max: 0,
    item_min: 0,
    vendas_hora: [],
    top_itens: [],
    margem_estimada: { receita_itens: 0, custo_estimado: 0, margem_estimada: 0 },
    observacoes: null,
  });

  const dataIso = useMemo(() => {
    const [dd, mm, yyyy] = (dataRef || "").split("/");
    if (!dd || !mm || !yyyy) return "";
    return `${yyyy}-${mm}-${dd}`;
  }, [dataRef]);

  async function carregar() {
    try {
      setErr("");
      setLoading(true);

      const url = new URL(`${API_BASE}/kpi_termometro_dia`);
      url.searchParams.set("id_empresa", String(idEmpresa));
      if (dataIso) url.searchParams.set("data", dataIso);
      if (taxaEntrega !== "" && taxaEntrega != null)
        url.searchParams.set("taxa_entrega", String(taxaEntrega));

      const r = await fetch(url.toString(), { cache: "no-store" });
      const json = await r.json().catch(() => ({}));

      const payload = Array.isArray(json) ? json[0] : json;
      const core = payload?.kpi_termometro_dia ?? payload ?? {};

      setKpi({
        pedidos: Number(core.pedidos ?? 0),
        receita_bruta: Number(core.receita_bruta ?? 0),
        receita_liquida: Number(core.receita_liquida ?? 0),
        entrega_qtd: Number(core.entrega_qtd ?? 0),
        retirada_qtd: Number(core.retirada_qtd ?? 0),
        entrega_taxa_unit: Number(core.entrega_taxa_unit ?? taxaEntrega ?? 0),
        entrega_taxa_total: Number(core.entrega_taxa_total ?? 0),
        ticket_medio_liquido: Number(core.ticket_medio_liquido ?? 0),
        pedido_max: Number(core.pedido_max ?? 0),
        pedido_min: Number(core.pedido_min ?? 0),
        item_max: Number(core.item_max ?? 0),
        item_min: Number(core.item_min ?? 0),
        vendas_hora: Array.isArray(core.vendas_hora) ? core.vendas_hora : [],
        top_itens: Array.isArray(core.top_itens) ? core.top_itens : [],
        margem_estimada: core.margem_estimada || {
          receita_itens: 0,
          custo_estimado: 0,
          margem_estimada: 0,
        },
        observacoes: core.observacoes ?? null,
      });
    } catch (e) {
      console.error(e);
      setErr("Falha ao carregar KPIs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fieldCls =
    "w-full rounded px-3 py-2 focus:outline-none transition-shadow";
  const fieldStyle = {
    background: THEME.fieldBg,
    color: THEME.text,
    border: `1px solid ${THEME.fieldBorder}`,
  };
  const onFocus = (e) => (e.target.style.boxShadow = `0 0 0 2px ${THEME.focusRing}55`);
  const onBlur = (e) => (e.target.style.boxShadow = "none");

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: THEME.pageBg, color: THEME.text }}
    >
      <div
        className="max-w-6xl mx-auto rounded-2xl shadow-xl border p-6"
        style={{ background: THEME.panelBg, borderColor: THEME.panelBorder }}
      >
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold" style={{ color: THEME.title }}>
            📊 Termômetro do Dia
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 rounded-lg font-semibold"
              style={{ background: THEME.btnDark, color: THEME.btnDarkText }}
            >
              ⬅️ Voltar
            </button>
            <button
              onClick={carregar}
              className="px-3 py-2 rounded-lg font-semibold"
              style={{ background: THEME.btnOrange, color: THEME.btnOrangeText }}
            >
              🔄 Recarregar
            </button>
          </div>
        </div>

        {/* filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <div>
            <label className="text-sm" style={{ color: THEME.textMuted }}>
              Empresa
            </label>
            <input
              value={idEmpresa}
              onChange={(e) => setIdEmpresa(Number(e.target.value || 0))}
              className={fieldCls}
              style={fieldStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div>
            <label className="text-sm" style={{ color: THEME.textMuted }}>
              Data
            </label>
            <input
              value={dataRef}
              onChange={(e) => setDataRef(e.target.value)}
              className={fieldCls}
              style={fieldStyle}
              placeholder="dd/mm/aaaa"
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div>
            <label className="text-sm" style={{ color: THEME.textMuted }}>
              Taxa por Entrega (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={taxaEntrega}
              onChange={(e) => setTaxaEntrega(e.target.value)}
              className={fieldCls}
              style={fieldStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={carregar}
              className="w-full px-3 py-2 rounded-lg font-semibold"
              style={{ background: THEME.btnOrange, color: THEME.btnOrangeText }}
            >
              Aplicar filtros
            </button>
          </div>
        </div>

        {err && (
          <div
            className="mb-4 rounded p-3"
            style={{ background: "#3b1f1f", color: "#fca5a5", border: "1px solid #7f1d1d" }}
          >
            {err}
          </div>
        )}

        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <Card title="Pedidos" value={kpi.pedidos} />
          <Card title="Receita Bruta" value={C(kpi.receita_bruta)} />
          <Card
            title="Taxa de Entrega (total)"
            value={`${C(kpi.entrega_taxa_total)} (${C(kpi.entrega_taxa_unit)} x ${kpi.entrega_qtd})`}
          />
          <Card title="Receita Líquida" value={C(kpi.receita_liquida)} />

          <Card title="Ticket Médio Líquido" value={C(kpi.ticket_medio_liquido)} />
          <Card title="Entrega" value={kpi.entrega_qtd} />
          <Card title="Retirada" value={kpi.retirada_qtd} />
          <Card title="Pedido Máx" value={C(kpi.pedido_max)} />

          <Card title="Pedido Mín" value={C(kpi.pedido_min)} />
          <Card title="Item Máx" value={C(kpi.item_max)} />
          <Card title="Item Mín" value={C(kpi.item_min)} />
          <Card
            title="Margem Estimada"
            value={`${C(kpi.margem_estimada?.margem_estimada || 0)} (Receita itens ${C(
              kpi.margem_estimada?.receita_itens || 0
            )} - Custo ${C(kpi.margem_estimada?.custo_estimado || 0)})`}
          />
        </div>

        {/* Tabelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: THEME.cardBg, border: `1px solid ${THEME.cardBorder}` }}
          >
            <div
              className="px-4 py-3 border-b font-semibold"
              style={{ borderColor: THEME.cardBorder, color: THEME.title }}
            >
              Vendas por Hora
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ color: THEME.textMuted }}>
                    <th className="p-2 text-left">Hora</th>
                    <th className="p-2 text-left">Pedidos</th>
                    <th className="p-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {kpi.vendas_hora.length ? (
                    kpi.vendas_hora.map((h, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${THEME.cardBorder}` }}>
                        <td className="p-2">{String(h.hora).padStart(2, "0")}:00</td>
                        <td className="p-2">{h.pedidos ?? 0}</td>
                        <td className="p-2">{C(h.total ?? 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3" style={{ color: THEME.textMuted }} colSpan={3}>
                        Sem movimento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{ background: THEME.cardBg, border: `1px solid ${THEME.cardBorder}` }}
          >
            <div
              className="px-4 py-3 border-b font-semibold"
              style={{ borderColor: THEME.cardBorder, color: THEME.title }}
            >
              Top Itens do Dia
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ color: THEME.textMuted }}>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Qtd</th>
                    <th className="p-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {kpi.top_itens.length ? (
                    kpi.top_itens.map((t, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${THEME.cardBorder}` }}>
                        <td className="p-2">{t.nome}</td>
                        <td className="p-2">{t.qtd ?? 0}</td>
                        <td className="p-2">{C(t.total ?? 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3" style={{ color: THEME.textMuted }} colSpan={3}>
                        Sem dados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {kpi.observacoes && (
          <div
            className="mt-6 text-sm rounded p-3"
            style={{ background: THEME.cardBg, border: `1px solid ${THEME.cardBorder}` }}
          >
            <div className="font-semibold mb-1" style={{ color: THEME.title }}>
              Observações do cálculo
            </div>
            <pre className="whitespace-pre-wrap" style={{ color: THEME.textMuted }}>
{JSON.stringify(kpi.observacoes, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: THEME.cardBg, border: `1px solid ${THEME.cardBorder}` }}
    >
      <div className="text-sm mb-1" style={{ color: THEME.textMuted }}>
        {title}
      </div>
      <div className="text-2xl font-bold" style={{ color: THEME.text }}>
        {value}
      </div>
    </div>
  );
}
