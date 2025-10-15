 import React from "react";

export default function ModalDetalhesPedido({ open, onClose, pedido }) {
  if (!open || !pedido) return null;

  const itens = pedido?.itens || [];
  const total = itens.reduce((sum, it) => sum + (Number(it.valor) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo escuro */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>

      {/* Modal */}
      <div
        className="relative bg-[#1b1e25] rounded-2xl w-[90vw] max-w-3xl max-h-[85vh] overflow-y-auto p-5 shadow-xl border"
        style={{ borderColor: "#ff9f43" }}
      >
        <div className="flex justify-between items-center border-b border-[#ff9f43] pb-3 mb-3">
          <h2 className="text-lg font-semibold text-[#ff9f43]">
            Pedido nº {pedido.pedido_id || pedido.numero}
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-[#2a2f39] text-gray-200 text-sm"
          >
            Fechar
          </button>
        </div>

        <div className="space-y-3 text-gray-200">
          <p>
            <strong>Cliente:</strong> {pedido.nome_cliente}
          </p>
          <p>
            <strong>Pagamento:</strong> {pedido.tipo_cobranca}
          </p>
          <p>
            <strong>Endereço:</strong> {pedido.endereco} – {pedido.bairro}
          </p>
          <p>
            <strong>Resumo:</strong>
          </p>
          <pre className="bg-[#151a23] p-3 rounded-xl text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap border border-[#ff9f4320]">
            {pedido.resumo}
          </pre>

          <h3 className="text-[#ff9f43] font-semibold mt-4">
            Itens do pedido:
          </h3>

          <ul className="divide-y divide-[#ff9f4320]">
            {itens.map((it, i) => (
              <li key={i} className="py-2">
                <div className="flex justify-between">
                  <span>
                    {it.nome}{" "}
                    {it.quantidade ? `(${it.quantidade}x)` : ""} –{" "}
                    <span className="text-gray-400">{it.categoria}</span>
                  </span>
                  <span>R$ {Number(it.valor).toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="text-right text-lg font-semibold text-[#ff9f43] mt-4">
            Total: R$ {total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
