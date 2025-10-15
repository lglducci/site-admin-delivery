 import React, { useEffect, useMemo, useState } from "react";

/**
 * Modal discreto para visualizar apenas os itens do pedido.
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - numero: number | string  (nº do pedido)
 * - idEmpresa: number | string
 */
export default function ModalVisualizar({ open, onClose, numero, idEmpresa }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carrega itens quando abrir
  useEffect(() => {
    if (!open || !numero || !idEmpresa) return;

    const fetchItens = async () => {
      setLoading(true);
      try {
        const url = `https://webhook.lglducci.com.br/webhook/visualizarcozinha?numero=${encodeURIComponent(
          numero
        )}&id_empresa=${encodeURIComponent(idEmpresa)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        // webhook retorna um array de itens
        setItens(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Erro ao carregar itens do pedido:", e);
        setItens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItens();
  }, [open, numero, idEmpresa]);

  // --- Resumo por categoria + total (sem alterar SQL/n8n) ---
  const resumo = useMemo(() => {
    const acc = { pizza: 0, borda: 0, esfirra: 0, bebida: 0, outros: 0, total: 0 };

    for (const it of itens) {
      const cat = String(it?.categoria || "").toLowerCase();
      const qtd = Number(it?.quantidade) > 0 ? Number(it.quantidade) : 1;

      if (cat.includes("pizza")) acc.pizza += qtd;
      else if (cat.includes("borda")) acc.borda += qtd;
      else if (cat.includes("esfirra")) acc.esfirra += qtd;
      else if (cat.includes("bebida")) acc.bebida += qtd;
      else acc.outros += qtd;

      acc.total += qtd;
    }
    return acc;
  }, [itens]);

  // string amigável do resumo (mostra só categorias com qtd > 0)
  const resumoTexto = useMemo(() => {
    const partes = [];
    if (resumo.pizza > 0) partes.push(`🍕 ${resumo.pizza} ${resumo.pizza === 1 ? "pizza" : "pizzas"}`);
    if (resumo.borda > 0) partes.push(`🧀 ${resumo.borda} ${resumo.borda === 1 ? "borda" : "bordas"}`);
    if (resumo.esfirra > 0) partes.push(`🫓 ${resumo.esfirra} ${resumo.esfirra === 1 ? "esfirra" : "esfirras"}`);
    if (resumo.bebida > 0) partes.push(`🥤 ${resumo.bebida} ${resumo.bebida === 1 ? "bebida" : "bebidas"}`);
    if (resumo.outros > 0) partes.push(`📦 ${resumo.outros} ${resumo.outros === 1 ? "outro item" : "outros itens"}`);

    const base = partes.join(" • ");
    return resumo.total > 0 ? `${base}${base ? " — " : ""}Total: ${resumo.total} ${resumo.total === 1 ? "item" : "itens"}` : "";
  }, [resumo]);

  if (!open) return null;

     // --- CSS global de impressão (sem cortar o modal) ---
  const printStyle = `
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    @media print {
      .fixed, .absolute { position: static !important; }
      .modal-backdrop, .bg-black\\\/60 { display:none !important; }

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
      .print-fullpage * { break-inside: avoid-page; }
      .print-fullpage li { page-break-inside: avoid; }

      .print-fullpage .overflow-auto,
      .print-fullpage .max-h-\\[68vh\\] {
        overflow: visible !important;
        max-height: none !important;
      }

      .print-fullpage [style*="background-color: #1b1e25"],
      .print-fullpage [style*="background-color: #151a23"],
      .print-fullpage [style*="background-color: #2a2f39"] {
        background: #fff !important;
        color: #000 !important;
      }

      .print-fullpage button { display: none !important; }
      .resumo-bruto { display: block !important; visibility: visible !important; }
    }
  `;
        // injeta estilo no DOM ao renderizar
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = printStyle;
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);


 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* container  */}

 <div
   className="relative w-[92vw] max-w-3xl max-h-[86vh] overflow-hidden rounded-2xl print-fullpage"
   
       
        style={{ backgroundColor: "#1b1e25", boxShadow: "0 0 24px rgba(0,0,0,0.5)" }}
      >
        {/* header */}
        <div className="px-5 py-3 border-b" style={{ borderColor: "#ff9f43" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold" style={{ color: "#ff9f43" }}>
              Detalhes do Pedido nº {numero}
            </h3>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs md:text-sm transition-colors"
              style={{ backgroundColor: "#2a2f39", color: "#e5e7eb" }}
            >
              Fechar
            </button>
          </div>

          {/* faixa-resumo no header */}
          {resumoTexto ? (
            <div className="mt-1 text-xs md:text-sm text-gray-200 opacity-90">
              {resumoTexto}
            </div>
          ) : null}
        </div>

        {/* content */}
        <div className="p-4 overflow-auto max-h-[68vh] text-sm md:text-base">
          {loading ? (
            <p className="text-gray-300">Carregando itens…</p>
          ) : itens.length === 0 ? (
            <p className="text-gray-400">Sem itens para exibir.</p>
          ) : (
            <ul className="space-y-3">
              {itens.map((it, idx) => {
                const categoria = (it.categoria || "").toLowerCase();
                const isPizza = categoria.includes("pizza");
                const isBebida = categoria.includes("bebida");
                const isBorda = categoria.includes("borda");
                const icone = isPizza ? "🍕" : isBebida ? "🥤" : isBorda ? "🧀" : "•";

                // número do item (ordem) com fallback
                const numeroItem =
                  it?.ordem_item ??
                  it?.ordem ??
                  it?.numero ??
                  idx + 1;

                const qtd = Number(it?.quantidade) > 0 ? Number(it.quantidade) : 1;

                return (
                  <li
                    key={idx}
                    className="rounded-lg p-3 border"
                    style={{
                      borderColor: isBorda ? "rgba(255, 220, 120, 0.4)" : "rgba(255,159,67,0.25)",
                      backgroundColor: isBorda ? "#1f1a12" : "#151a23",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {/* badge com número do item */}
                          <span
                            className="inline-flex items-center justify-center rounded-full text-[11px] w-6 h-6 shrink-0"
                            style={{ backgroundColor: "#2a2f39", color: "#ffcf99", border: "1px solid rgba(255,159,67,0.35)" }}
                            title={`Item ${numeroItem}`}
                          >
                            {numeroItem}
                          </span>

                          <span className="text-base">{icone}</span>

                          <span className="font-semibold" style={{ color: "#ff9f43" }}>
                            {it.nome || "Item"}
                          </span>
                        </div>

                        <div className="mt-1 text-gray-300">
                          {it.tamanho ? `Tamanho: ${it.tamanho}` : null}
                          {it.tamanho && qtd ? " • " : ""}
                          {qtd ? `Qtd: ${qtd}` : null}
                          {categoria ? (
                            <>
                              {(it.tamanho || qtd) ? " • " : ""}
                              <span className="uppercase tracking-wide text-xs opacity-80">
                                {categoria}
                              </span>
                            </>
                          ) : null}

                          {it.descricao ? (
                            <div className="mt-1 text-sm text-gray-400 leading-snug">
                              {it.descricao}
                            </div>
                          ) : null}
                        </div>

                        {/* vínculo pai/filho */}
                        {it.numero_pai || it.nome_pai ? (
                          <div className="mt-1 text-xs text-gray-400">
                            Vinculado a: {it.nome_pai || `#${it.numero_pai}`}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
