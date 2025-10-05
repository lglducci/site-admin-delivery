 import React from "react";

export default function PedidoCard({ pedido, onAvancar }) {
  const { numero, nomeCliente, valor, data, status } = pedido;

  const dataFormatada = new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 mb-3 rounded-2xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]">
      {/* Cabeçalho do pedido */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
          Pedido{" "}
          <a
            href={`https://webhook.lglducci.com.br/webhook/pedido_detalhe?numero=${numero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            nº {numero}
          </a>
        </h3>
        <span className="text-xs text-gray-500">{dataFormatada}</span>
      </div>

      {/* Detalhes */}
      <p className="text-gray-700 dark:text-gray-300">
        🧍 <strong>{nomeCliente}</strong>
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        💰 {valor?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>

      {/* Botão de avançar */}
      <button
        onClick={() => onAvancar(numero)}
        className="mt-3 w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-2 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all shadow-md"
      >
        ▶️ Avançar Pedido
      </button>
    </div>
  );
}
