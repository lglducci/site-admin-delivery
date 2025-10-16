 import React, { useEffect, useMemo, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";

/**
 * Modal discreto para visualizar apenas os itens do pedido.
 */
export default function ModalVisualizar({ open, onClose, numero, idEmpresa }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Pedido ${numero}`,
  });

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

  useEffect(() => {
    if (!open || !numero || !idEmpresa) return;
    const fetchItens = async () => {
      setLoading(true);
      try {
        const url = `https://webhook.lglducci.com.br/webhook/visualizarcozinha?numero=${numero}&id_empresa=${idEmpresa}`;
        const resp = await fetch(url);
        const data = await resp.json();
        setItens(Array.isArray(data) ? data : []);
      } catch {
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        ref={printRef}
        className="print-area relative w-[92vw] max-w-3xl max-h-[86vh] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: "#fff9f0",
          color: "#091219",
          border: "1px solid #ff9f43",
          boxShadow: "0 0 24px rgba(255,159,67,0.3)",
        }}
      >
        {/* header */}
        <div className="px-5 py-3 border-b" style={{ borderColor: "#ff9f43" }}>
          <div className="flex items-center justify-between">
            <h3
              className="text-base md:text-lg font-semibold"
              style={{ color: "#ff9f43" }}
            >
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
        </div>

        {/* content */}
        <div className="p-4 overflow-auto max-h-[68vh] text-sm md:text-base">
          {loading ? (
            <p>Carregando itens…</p>
          ) : itens.length === 0 ? (
            <p>Sem itens para exibir.</p>
          ) : (
            <ul className="space-y-3">
              {itens.map((it, idx) => (
                <li
                  key={idx}
                  className="rounded-lg p-3 border"
                  style={{
                    borderColor: "rgba(255,159,67,0.6)",
                    backgroundColor: "#fffdf8",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base">
                      {it.categoria?.includes("pizza")
                        ? "🍕"
                        : it.categoria?.includes("bebida")
                        ? "🥤"
                        : it.categoria?.includes("borda")
                        ? "🧀"
                        : "•"}
                    </span>
                    <div>
                      <strong style={{ color: "#ff9f43" }}>
                        {it.nome || "Item"}
                      </strong>
                      <div className="text-sm text-gray-800">
                        {it.tamanho ? `Tamanho: ${it.tamanho} • ` : ""}
                        Qtd: {it.quantidade || 1} •{" "}
                        {it.categoria?.toUpperCase()}
                      </div>
                      {it.descricao && (
                        <div className="text-xs text-gray-700 leading-snug">
                          {it.descricao}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
