import React, { useEffect, useState } from "react";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* container */}
      <div className="relative w-[92vw] max-w-3xl max-h-[86vh] overflow-hidden rounded-2xl"
           style={{ backgroundColor: "#1b1e25", boxShadow: "0 0 24px rgba(0,0,0,0.5)" }}>
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
                const icone = isPizza ? "🍕" : isBebida ? "🧃" : "•";

                return (
                  <li
                    key={idx}
                    className="rounded-lg p-3 border"
                    style={{
                      borderColor: "rgba(255,159,67,0.25)",
                      backgroundColor: "#151a23",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{icone}</span>
                          <span className="font-semibold" style={{ color: "#ff9f43" }}>
                            {it.nome || "Item"}
                          </span>
                        </div>
                        <div className="mt-1 text-gray-300">
                          {it.tamanho ? `Tamanho: ${it.tamanho}` : null}
                          {it.tamanho && it.quantidade ? " • " : ""}
                          {it.quantidade ? `Qtd: ${it.quantidade}` : null}
                          {categoria ? (
                            <>
                              {(it.tamanho || it.quantidade) ? " • " : ""}
                              <span className="uppercase tracking-wide text-xs opacity-80">
                                {categoria}
                              </span>
                            </>
                          ) : null}
                        </div>
                        {/* se houver relação pai/filho, mostra discretamente */}
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
