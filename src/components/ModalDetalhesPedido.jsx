import React, { useEffect, useState } from "react";

export default function ModalDetalhesPedido({ open, onClose, numero, idEmpresa }) {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !numero || !idEmpresa) return;

    const fetchPedido = async () => {
      setLoading(true);
      try {
        const url = `https://webhook.lglducci.com.br/webhook/pedido_detalhado?numero=${encodeURIComponent(
          numero
        )}&id_empresa=${encodeURIComponent(idEmpresa)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data && data.pedido_detalhado) setPedido(data.pedido_detalhado);
        else setPedido(null);
      } catch (e) {
        console.error("Erro ao carregar detalhes do pedido:", e);
        setPedido(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [open, numero, idEmpresa]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-[92vw] max-w-3xl max-h-[86vh] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: "#1b1e25",
          boxShadow: "0 0 24px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="px-5 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "#ff9f43" }}
        >
          <h3
            className="text-base md:text-lg font-semibold"
            style={{ color: "#ff9f43" }}
          >
            Pedido nº {numero}
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs md:text-sm transition-colors"
            style={{ backgroundColor: "#2a2f39", color: "#e5e7eb" }}
          >
            Fechar
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[68vh] text-sm md:text-base text-gray-200">
          {loading ? (
            <p className="text-gray-400">Carregando detalhes...</p>
          ) : !pedido ? (
            <p className="text-gray-400">Nenhum detalhe encontrado.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-[#ff9f43]">
                  {pedido.nome_cliente}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  💳 {pedido.tipo_cobranca?.toUpperCase() || "Pagamento não informado"}
                </p>
                <p className="text-sm text-gray-400">
                  🏠 {pedido.endereco} – {pedido.bairro}
                </p>
              </div>

              <div>
                <h4 className="text-base font-semibold mb-2 text-[#ff9f43]">
                  Itens do Pedido
                </h4>
                <ul className="space-y-2">
                  {pedido.itens?.map((it, idx) => {
                    const icone =
                      (it.categoria || "").includes("pizza")
                        ? "🍕"
                        : (it.categoria || "").includes("bebida")
                        ? "🥤"
                        : "•";
                    return (
                      <li
                        key={idx}
                        className="rounded-lg p-3 border"
                        style={{
                          borderColor: "rgba(255,159,67,0.25)",
                          backgroundColor: "#151a23",
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-base font-semibold text-[#ff9f43]">
                              {icone} {it.nome}
                            </span>
                            <div className="text-gray-300 text-sm">
                              {it.categoria}
                              {it.fracionada ? " • Fracionada" : ""}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-100">
                              R$ {Number(it.valor).toFixed(2)}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Qtd: {it.quantidade}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h4 className="text-base font-semibold mb-2 text-[#ff9f43]">
                  Resumo do Pedido
                </h4>
                <pre className="text-gray-300 text-sm whitespace-pre-wrap bg-[#151a23] p-3 rounded-lg border"
                     style={{ borderColor: "rgba(255,159,67,0.25)" }}>
                  {pedido.resumo}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
