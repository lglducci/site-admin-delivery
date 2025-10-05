 import React from "react";

export default function PedidoCard({ pedido }) {
  const dataPedido = new Date(pedido.data);
  const hora = dataPedido.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const empresaId = localStorage.getItem("id_empresa"); // ✅ Pega o id_empresa salvo no login

  // ▶️ Avançar pedido
  const handleAvancar = async () => {
    try {
      const resposta = await fetch("https://webhook.lglducci.com.br/webhook/avancar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: pedido.numero,
          id_empresa: empresaId, // ✅ envia id da empresa
        }),
      });

      if (!resposta.ok) throw new Error("Erro ao avançar pedido");
      alert(`✅ Pedido nº ${pedido.numero} avançado com sucesso.`);
      window.location.reload();
    } catch (erro) {
      alert("❌ Erro ao avançar o pedido.");
      console.error(erro);
    }
  };

  // ❌ Cancelar pedido
  const cancelarPedido = async (numero) => {
    try {
      const resposta = await fetch("https://webhook.lglducci.com.br/webhook/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero,
          id_empresa: empresaId, // ✅ envia id da empresa
        }),
      });

      if (!resposta.ok) throw new Error("Erro ao cancelar pedido");
      alert(`🚫 Pedido nº ${numero} cancelado com sucesso.`);
      window.location.reload();
    } catch (erro) {
      alert("❌ Erro ao cancelar o pedido.");
      console.error(erro);
    }
  };

  return (
    <div className="flex justify-between items-center px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 mb-2 text-sm font-medium text-gray-800 dark:text-white">
      <div className="flex-1">
        <span className="text-blue-900 dark:text-blue-300">
          {/* 🔗 Link para abrir o detalhes.html */}
          <a
            href={`/detalhes.html?numero=${pedido.numero}&id_empresa=${empresaId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-semibold"
          >
            nº {pedido.numero}
          </a>{" "}
          - {pedido.nomeCliente}
        </span>
      </div>

      <div className="text-gray-500 dark:text-gray-300 text-xs mx-2">{hora}</div>

      <div className="flex space-x-2 items-center">
        <button
          onClick={handleAvancar}
          className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-white text-xs"
          title="Avançar pedido"
        >
          ▶️
        </button>
        <button
          onClick={() => cancelarPedido(pedido.numero)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-white text-xs"
          title="Cancelar pedido"
        >
          ❌
        </button>
      </div>
    </div>
  );
}
