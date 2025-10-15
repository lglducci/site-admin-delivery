 import React, { useEffect, useMemo, useState } from "react";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";



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

  // --- CSS global de impressão (sem cortar o modal) ---
  const printStyle = `
    @page {
      size: A4 portrait;
      margin: 12mm;
    }

    @media print {
      .fixed, .absolute { position: static !important; }
      .bg-black, .bg-black\\/70, .bg-black\\/60 { background: #fff !important; }
      .print-fullpage {
        width: 100% !important;
        max-width: none !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        box-shadow: none !important;
        border: none !important;
        background: #fff !important;
        color: #000 !important;
      }
      .print-fullpage * { break-inside: avoid-page; page-break-inside: avoid; }
      .print-fullpage table { border-collapse: collapse !important; }
      .print-fullpage table th, 
      .print-fullpage table td {
        border: 1px solid #ccc !important;
        color: #000 !important;
      }
      .print-fullpage button { display: none !important; }
      .resumo-bruto { display: block !important; visibility: visible !important; }
    }
  `;

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = printStyle;
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);

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
      const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pedido-${numero}`,
  });

 
  if (!open) return null;

 

 
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
   <div
   ref={printRef}
    className="bg-[#1B1E25] text-white rounded-2xl shadow-2xl w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto p-6 relative border border-[#ff9f43]/40 print-fullpage"

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
          aria-label="Fechar"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-1 text-[#ff9f43]">
          Detalhes do Pedido nº {numero}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          {tipo_cobranca ? `Pagamento: ${String(tipo_cobranca).toUpperCase()}` : ""}
        </p>

        {erro && <p className="text-red-400 mb-4">{erro}</p>}

        {data?.html ? (
          <div
            className="prose prose-invert max-w-none text-gray-200"
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        ) : (
          <>
            {/* Cliente + Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0F121A] rounded-xl p-3 border border-[#ff9f43]/20">
                <div className="text-xs text-gray-400">Cliente</div>
                <div className="text-sm font-semibold">{nome_cliente || "—"}</div>
              </div>
              <div className="bg-[#0F121A] rounded-xl p-3 border border-[#ff9f43]/20">
                <div className="text-xs text-gray-400">Endereço</div>
                <div className="text-sm">
                  {endereco ? `${endereco}${bairro ? ` – ${bairro}` : ""}` : "—"}
                </div>
              </div>
            </div>

            {/* Itens */}
            <div className="rounded-xl overflow-hidden border border-[#ff9f43]/20 mb-4">
              <table className="w-full text-sm">
                <thead className="bg-[#0F121A]">
                  <tr className="text-left">
                    <th className="px-3 py-2">Item</th>
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
                        <tr key={idx} className="border-t border-[#ff9f43]/10">
                          <td className="px-3 py-2">
                            <div className="font-medium">{it.nome || "—"}</div>
                            <div className="text-xs text-gray-400">
                              {it.categoria || it.tipo || ""}
                              {it.fracionada ? " • fracionada" : ""}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">{qtd}</td>
                          <td className="px-3 py-2 text-right">{formatBRL(val)}</td>
                          <td className="px-3 py-2 text-right">{formatBRL(sub)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-gray-400">
                        Sem itens para este pedido.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totais */}
            <div className="flex flex-col gap-2 items-end">
              <div className="text-sm text-gray-300">
                Subtotal: <span className="font-semibold">{formatBRL(subtotal)}</span>
              </div>
              <div className="text-sm text-gray-300">
                Entrega: <span className="font-semibold">{formatBRL(entrega)}</span>
              </div>
              <div className="text-lg font-bold text-[#ff9f43]">
                Total: {formatBRL(total)}
              </div>
            </div>

            {/* Resumo bruto sempre impresso */}
            {data?.resumo && (
              <div className="mt-4 resumo-bruto">
                <h4 className="text-sm text-gray-400 mb-1">Resumo bruto:</h4>
                <pre className="p-3 bg-[#0F121A] rounded-lg text-xs whitespace-pre-wrap text-gray-300">
                  {data.resumo}
                </pre>
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-right flex gap-2 justify-end">
          <button

           
            
            onClick={handlePrint}
           
            className="bg-[#2a2f39] text-gray-100 font-semibold px-4 py-2 rounded-md hover:bg-[#3a3f49] transition"
          >
            🖨️ Imprimir
          </button>
          <button
            onClick={onClose}
            className="bg-[#ff9f43] text-[#1B1E25] font-semibold px-4 py-2 rounded-md hover:bg-[#ffb763] transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
