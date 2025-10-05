 import React from "react";

export default function PedidoCard({ pedido, onAvancar }) {
  const handleAvancar = (e) => {
    e.stopPropagation(); // evita conflito com o link
    if (onAvancar) onAvancar(pedido.numero);
  };

  return (
    <div
      className="cursor-pointer bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-700 p-4 rounded-xl shadow-md mb-3 border border-gray-300 dark:border-gray-700 transition-all duration-200"
      onClick={handleAvancar}
      onTouchEnd={handleAvancar}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            nº {pedido.numero}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pedido.nomeCliente}
          </p>
        </div>
        <p className="text-right font-bold text-orange-600 dark:text-orange-400">
          R$ {pedido.valor?.toFixed(2)}
        </p>
      </div>

      {/* Link para visualizar o pedido */}
      <a
        href={`https://webhook.lglducci.com.br/webhook/pedido_detalhe?numero=${pedido.numero}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
      >
        🔍 Ver detalhes
      </a>
    </div>
  );
}
