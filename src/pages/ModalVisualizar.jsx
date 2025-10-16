 import React, { useEffect, useMemo, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Modal discreto para visualizar apenas os itens do pedido.
 */
export default function ModalVisualizar({ open, onClose, numero, idEmpresa }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  // ✅ Função de impressão
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pedido ${numero}`,
  });

  // --- CSS global para impressão ---
  const printStyle = `
    @page { size: A4 portrait; margin: 12mm; }
    @media print {
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible; }
      .print-area { position: absolute; left: 0; top: 0; width: 100%; }
    }
  `;

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = printStyle;
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);

  // --- Resumo por categoria + total ---
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

  const resumoTexto = useMemo(() => {
    const partes = [];
    if (resumo.pizza > 0) partes.push(`🍕 ${resumo.pizza} ${resumo.pizza === 1 ? "pizza" : "pizzas"}`);
    if (resumo.borda > 0) partes.push(`🧀 ${resumo.borda} ${resumo.borda === 1 ? "borda" : "bordas"}`);
    if (resumo.esfirra > 0) partes.push(`🫓 ${resumo.esfirra} ${resumo.esfirra === 1 ? "esfirra" : "esfirras"}`);
    if (resumo.bebida > 0) partes.push(`🥤 ${resumo.bebida} ${resumo.bebida === 1 ? "bebida" : "bebidas"}`);
    if (resumo.outros > 0) partes.push(`📦 ${resumo.outros} ${resumo.outros === 1 ? "outro item" : "outros itens"}`);
    const base = partes.join(" • ");
    return resumo.total > 0
      ? `${base}${base ? " — " : ""}Total: ${resumo.total} ${resumo.total === 1 ? "item" : "itens"}`
      : "";
  }, [resumo]);

  // --- Busca dos itens ---
  useEffect(() => {
    if (!open || !numero || !idEmpresa) return;
    const fetchItens = async () => {
      setLoading(true);
      try {
        const url = `https://webhook.lglducci.com.br/webhook/visualizarcozinha?numero=${numero}&id_empresa=${idEmpresa}`;
        const resp = await fetch(url);
        const data = await resp.json();
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* fundo */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* container */}
      <div
        ref={printRef}
        className="print-area relative w-[92vw] max-w-3xl max-h-[86vh] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: " #012e46",  
          color: "#091219",
          border: "1px solid #ff9f43",
          boxShadow: "0 0 24px rgba(255,159,67,0.3)",
        }}
      >
        {/* header */}
        <div className="px-5 py-3 border-b" style={{ borderColor: "#ff9f43" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold" style={{ color: "#ff9f43" }}>
              Detalhes do Pedido nº {numero}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-md text-xs md:text-sm transition-colors"
                style={{ backgroundColor: "#2a2f39", color: "#e5e7eb" }}
              >
                Imprimir
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-xs md:text-sm transition-colors"
                style={{ backgroundColor: "#2a2f39", color: "#e5e7eb" }}
              >
                Fechar
              </button>
            </div>
          </div>

          
  {/* resumo */}
          {resumoTexto && (
            <div
  className="mt-1 text-xs md:text-sm resumo-bruto"
  style={{ color: "#091219", fontWeight: "600" }}
>
  {resumoTexto}
</div>

          )}
        </div>

           
       

        {/* conteúdo */}
        <div className="p-4 overflow-auto max-h-[68vh] text-sm md:text-base">
          {loading ? (
            <p className="text-gray-900">Carregando itens…</p>
          ) : itens.length === 0 ? (
            <p className="text-gray-800">Sem itens para exibir.</p>
          ) : (
            <ul className="space-y-3">
              {itens.map((it, idx) => {
                const categoria = (it.categoria || "").toLowerCase();
                const isPizza = categoria.includes("pizza");
                const isBebida = categoria.includes("bebida");
                const isBorda = categoria.includes("borda");
                const icone = isPizza ? "🍕" : isBebida ? "🥤" : isBorda ? "🧀" : "•";

                const numeroItem =
                  it?.ordem_item ?? it?.ordem ?? it?.numero ?? idx + 1;
                const qtd = Number(it?.quantidade) > 0 ? Number(it.quantidade) : 1;

                return (
                  <li
                    key={idx}
                    className="rounded-lg p-3 border"
                    style={{
                      borderColor: isBorda
                        ? "rgba(255, 180, 50, 0.5)"
                        : "rgba(255,159,67,0.6)",
                      backgroundColor: isBorda ? "#fff7e6" : "#fffdf8",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center justify-center rounded-full text-[11px] w-6 h-6 shrink-0"
                            style={{
                              backgroundColor: "#ffecd2",
                              color: "#1b1e25",
                              border: "1px solid rgba(255,159,67,0.6)",
                            }}
                            title={`Item ${numeroItem}`}
                          >
                            {numeroItem}
                          </span>

                          <span className="text-base">{icone}</span>
                          <span className="font-semibold" style={{ color: "#ff9f43" }}>
                            {it.nome || "Item"}
                          </span>
                        </div>

                        <div className="mt-1 text-gray-800">
                          {it.tamanho ? `Tamanho: ${it.tamanho}` : null}
                          {it.tamanho && qtd ? " • " : ""}
                          {qtd ? `Qtd: ${qtd}` : null}
                          {categoria && (
                            <>
                              {(it.tamanho || qtd) ? " • " : ""}
                              <span className="uppercase tracking-wide text-xs opacity-80">
                                {categoria}
                              </span>
                            </>
                          )}

                          {it.descricao && (
                            <div className="mt-1 text-sm text-gray-900 leading-snug">
                              {it.descricao}
                            </div>
                          )}

                          {/* 🔙 Vinculado a item ou borda */}
                          {(it.numero_pai || it.nome_pai) && (
                            <div className="mt-1 text-xs text-gray-900">
                              Vinculado a: {it.nome_pai || `#${it.numero_pai}`}
                            </div>
                          )}
                        </div>
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
