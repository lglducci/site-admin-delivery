  import React from "react";

export default function PedidoCard({ pedido }) {
  const hoje = new Date().toDateString();
  const dataPedido = new Date(pedido.data);
  const ehHoje = dataPedido.toDateString() === hoje;

  const hora = dataPedido.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const mostrarData = ehHoje ? "hoje" : dataPedido.toLocaleDateString("pt-BR");

  const handleAvancar = async () => {
    try {
      const resposta = await fetch(
        `https://webhook.lglducci.com.br/webhook/avancar?numero=${pedido.numero}`
      );
      if (!resposta.ok) throw new Error("Erro ao avançar pedido");
      alert(`Pedido nº ${pedido.numero} avançado com sucesso.`);
    } catch (erro) {
      alert("Erro ao avançar o pedido.");
    }
  };

  return (
    <div className="flex justify-between items-center px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 mb-2 text-sm font-medium text-gray-800 dark:text-white">
      <div className="flex-1">
        <span className="text-blue-900 dark:text-blue-300">
          <a
            href={`/detalhes.html?numero=${pedido.numero}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            nº {pedido.numero}
          </a>{" "}
          - {pedido.nomeCliente}
        </span>
      </div>

      <div className="text-gray-500 dark:text-gray-300 text-xs mx-2">
        {mostrarData} às {hora}
      </div>

      <button
        onClick={handleAvancar}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-white text-xs"
      >
        Avançar
      </button>
    </div>
  );
}



