 // src/components/ModalDetalhesPedido.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";

/* === TEMA PADRÃO (azul/laranja) === */
const THEME = {
  cardBg:    "#012e46",                 // “cor do bloco do login #254759”

 
  border:    "rgba(255,159,67,0.30)",   // borda laranja suave
  title:     "#ff9f43",
  text:      "#e8eef2",
  textMuted: "#bac7cf",
  chipBg:    "#2a2f39",
  chipText:  "#e5e7eb",
  btnDark:   "#2a2f39",
  btnDarkText:"#e5e7eb",
  btnOrange: "#ff9f43",
  btnOrangeText:"#1b1e25",
};

function parseMoneyFromResumo(resumo, label) {
  if (!resumo) return null;
  const re = new RegExp(`${label}\\s*:\\s*R\\$\\s*([0-9]+[\\.,]?[0-9]{0,2})`, "i");
  const m = resumo.match(re);
  if (!m) return null;
  const raw = m[1].replace(",", ".");
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function formatBRL(n) {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${Number(n).toFixed(2)}`;
  }
}

export default function ModalDetalhesPedido({ open, onClose, numero, idEmpresa }) {
  const [data, setData] = useState(null);
  const [erro, setErro] = useState("");
  const printRef = useRef(null);

  // CSS de impressão mínimo (não interfere no layout principal)
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @page { size: A4 portrait; margin: 12mm; }
      @media print { button { display: none !important; } }
    `;
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);

  // Imprimir só a modal (nova janela; aguarda onload)
  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;

    const html = `
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>Pedido nº ${numero}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #000; background: #fff; }
            h1,h2,h3 { margin: 0 0 8px; }
            .muted { color: #444; font-size: 12px; }
            .badge { display:inline-block; padding:2px 6px; border:1px solid #ddd; border-radius:6px; font-size:12px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
            th { background: #f2f2f2; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `;

    const w = window.open("", "PRINT", "width=900,height=650");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      w.focus();
      w.print();
      w.close();
    };
  };

  // Busca dos dados
  useEffect(() => {
    if (!open || !numero) return;
    const carregar = async () => {
      try {
        const url = `https://webhook.lglducci.com.br/webhook/pedido_detalhado?numero=${numero}&id_empresa=${idEmpresa}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        let json;
        try {
          json = await resp.json();
        } catch {
          const text = await resp.text();
          setData({ html: text });
          setErro("");
          return;
        }

        let payload = json;
        if (Array.isArray(json) && json.length > 0) payload = json[0];
        if (payload && payload.pedido_detalhado) payload = payload.pedido_detalhado;

        setData(payload || {});
        setErro("");
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar detalhes do pedido.");
      }
    };

    carregar();
  }, [open, numero, idEmpresa]);

  const { itens = [], nome_cliente, tipo_cobranca, endereco, bairro, resumo } = data || {};

  const subtotal = useMemo(() => {
    if (!Array.isArray(itens)) return 0;
    return itens.reduce((acc, it) => acc + (Number(it.valor) || 0) * (Number(it.quantidade) || 1), 0);
  }, [itens]);

  const entregaFromResumo = useMemo(() => parseMoneyFromResumo(resumo, "Entrega"), [resumo]);
  const totalFromResumo = useMemo(() => parseMoneyFromResumo(resumo, "Total"), [resumo]);

  const entrega = entregaFromResumo ?? 0;
  const total = totalFromResumo ?? (subtotal + entrega);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        ref={printRef}
        className="relative w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl border p-6"
        style={{
          background: THEME.cardBg,
          borderColor: THEME.border,
          color: THEME.text,
        }}
      >
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-sm px-2 py-1 rounded-md"
          style={{ background: THEME.btnDark, color: THEME.btnDarkText }}
          aria-label="Fechar"
          title="Fechar"
        >
          ✖
        </button>

        {/* Título */}
        <h2 className="text-2xl font-bold mb-1" style={{ color: THEME.title }}>
          Detalhes do Pedido nº {numero}
        </h2>
        <p className="text-sm mb-4" style={{ color: THEME.textMuted }}>
          {tipo_cobranca ? `Pagamento: ${String(tipo_cobranca).toUpperCase()}` : ""}
        </p>

        {erro && <p className="mb-4" style={{ color: "#fca5a5" }}>{erro}</p>}

        {/* HTML bruto (fallback) */}
        {data?.html ? (
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        ) : (
          <>
            {/* Cliente + Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div
                className="rounded-xl p-3 border"
                style={{ background: "#1b3c4d", borderColor: THEME.border }}
              >
                <div className="text-xs" style={{ color: THEME.textMuted }}>Cliente</div>
                <div className="text-sm font-semibold">{nome_cliente || "—"}</div>
              </div>
              <div
                className="rounded-xl p-3 border"
                style={{ background: "#1b3c4d", borderColor: THEME.border }}
              >
                <div className="text-xs" style={{ color: THEME.textMuted }}>Endereço</div>
                <div className="text-sm">
                  {endereco ? `${endereco}${bairro ? ` – ${bairro}` : ""}` : "—"}
                </div>
              </div>
            </div>

            {/* Itens */}
            <div className="rounded-xl overflow-hidden border mb-4" style={{ borderColor: THEME.border }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#1b3c4d", color: THEME.text }}>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-center">Qtd</th>
                    <th className="px-3 py-2 text-right">Valor</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(itens) && itens.length > 0 ? (
                    itens.map((it, idx) => {
                      const qtd = Number(it.quantidade) || 1;
                      const val = Number(it.valor) || 0;
                      const sub = qtd * val;
                      return (
                        <tr key={idx} className="border-t" style={{ borderColor: "rgba(255,159,67,0.15)" }}>
                          <td className="px-3 py-2 align-top">
                            <div className="font-medium">{it.nome || "—"}</div>
                            <div className="text-xs" style={{ color: THEME.textMuted }}>
                              {it.categoria || it.tipo || ""}
                              {it.fracionada ? " • fracionada" : ""}
                            </div>

                            {/* Vinculado a: (restaurado) */}
                            {(it.nome_pai || it.numero_pai) ? (
                              <div className="mt-1 text-xs">
                                <span style={{ color: THEME.textMuted }}>Vinculado a: </span>
                                {it.nome_pai ? (
                                  <span
                                    className="inline-block px-2 py-0.5 rounded-md mr-2"
                                    style={{ background: THEME.chipBg, color: THEME.chipText }}
                                  >
                                    {it.nome_pai}
                                  </span>
                                ) : null}
                                {it.numero_pai ? (
                                  <span className="muted"># {it.numero_pai}</span>
                                ) : null}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-center align-top">{qtd}</td>
                          <td className="px-3 py-2 text-right align-top">{formatBRL(val)}</td>
                          <td className="px-3 py-2 text-right align-top">{formatBRL(sub)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center" style={{ color: THEME.textMuted }}>
                        Sem itens para este pedido.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totais */}
            <div className="flex flex-col gap-2 items-end">
              <div className="text-sm">
                <span style={{ color: THEME.textMuted }}>Subtotal: </span>
                <span className="font-semibold">{formatBRL(subtotal)}</span>
              </div>
              <div className="text-sm">
                <span style={{ color: THEME.textMuted }}>Entrega: </span>
                <span className="font-semibold">{formatBRL(entrega)}</span>
              </div>
              <div className="text-lg font-bold" style={{ color: THEME.title }}>
                Total: {formatBRL(total)}
              </div>
            </div>

            {/* Resumo bruto (se houver) */}
            {data?.resumo && (
              <div className="mt-4">
                <h4 className="text-sm" style={{ color: THEME.textMuted }}>Resumo bruto:</h4>
                <pre
                  className="p-3 rounded-lg text-xs whitespace-pre-wrap"
                  style={{ background: "#1b3c4d", color: THEME.text }}
                >
{data.resumo}
                </pre>
              </div>
            )}
          </>
        )}

        {/* Ações */}
        <div className="mt-6 text-right flex gap-2 justify-end">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-md font-semibold transition"
            style={{ background: THEME.btnDark, color: THEME.btnDarkText }}
          >
            🖨️ Imprimir
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-semibold transition"
            style={{ background: THEME.btnOrange, color: THEME.btnOrangeText }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
