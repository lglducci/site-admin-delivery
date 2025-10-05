 import React from "react";

export default function PedidoCard({ pedido }) {
  const dataPedido = new Date(pedido.data);
  const hora = dataPedido.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const empresaId = localStorage.getItem("id_empresa");

  const handleAvancar = async () => {
    try {
      const resp = await fetch("https://webhook.lglducci.com.br/webhook/avancar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: pedido.numero,
          id_empresa: empresaId,
        }),
      });
      if (!resp.ok) throw new Error();
      alert(`Pedido nº ${pedido.numero} avançado com sucesso.`);
      window.location.reload();
    } catch {
      alert("Erro ao avançar o pedido.");
    }
  };

  const handleCancelar = async () => {
    if (!confirm("Tem certeza que deseja cancelar o pedido?")) return;
    try {
      const resp = await fetch("https://webhook.lglducci.com.br/webhook/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: pedido.numero,
          id_empresa: empresaId,
        }),
      });
      if (!resp.ok) throw new Error();
      alert(`Pedido nº ${pedido.numero} cancelado com sucesso.`);
      window.location.reload();
    } catch {
      alert("Erro ao cancelar o pedido.");
    }
  };

  return (
    <div className="flex justify-between items-center px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 mb-2 text-sm font-medium text-gray-800 dark:text-white">
      <div className="flex-1">
        <a
          href={`/detalhes.html?numero=${pedido.numero}&id_empresa=${empresaId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-800 hover:underline font-semibold"
        >
          nº {pedido.numero}
        </a>{" "}
        - {pedido.nomeCliente || pedido.nome}
        <div className="text-xs text-gray-500 dark:text-gray-300">{hora}</div>
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={handleAvancar}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-white text-xs"
        >
          ▶️
        </button>
        <button
          onClick={handleCancelar}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-white text-xs"
        >
          ❌
        </button>
      </div>
    </div>
  );
}
