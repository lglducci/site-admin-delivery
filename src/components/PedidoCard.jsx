 import React from "react";

export default function PedidoCard({ pedido, onAvancar }) {
  const { numero, nomeCliente, valor, data, status } = pedido;

  // Formata data simples
  const dataFormatada = new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 mb-3 rounded-xl shadow-md transition-all hover:shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
          Pedido nº <a
            href={`https://webhook.lglducci.com.br/webhook/pedido_detalhe?numero=${numero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {numero}
          </a>
        </h3>
        <span className="text-sm text-gray-500">{dataFormatada}</span>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mt-1">
        🧍‍♂️ <strong>{nomeCliente}</strong>
      </p>
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        💰 {valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>

      <button
        onClick={() => onAvancar(numero)}
        className="mt-2 w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-2 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all shadow-md"
      >
        Avançar ▶️
      </button>
    </div>
  );
}
