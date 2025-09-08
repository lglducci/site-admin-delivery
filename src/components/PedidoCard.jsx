 import { ArrowRight, XCircle } from "lucide-react"; // ⬅️ Ícones
import React from "react";

const PedidoCard = ({ pedido, onAvancar }) => {
  const agora = new Date();
  const dataPedido = new Date(pedido.data);
  const minutosParado = Math.floor((agora - dataPedido) / 60000);
  const isParado = minutosParado > 15;

  const tempoTexto =
    minutosParado >= 1
      ? `⏱️ Aguardando há ${minutosParado} minuto${minutosParado > 1 ? "s" : ""}`
      : `⏱️ Pedido recente`;

  const cancelarPedido = () => {
    const confirmar = window.confirm(
      `Tem certeza que deseja cancelar o pedido nº ${pedido.numero}?`
    );
    if (!confirmar) return;

    fetch("https://webhook.lglducci.com.br/webhook/cancelar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: pedido.numero }),
    })
      .then(() => {
        alert(`Pedido ${pedido.numero} cancelado!`);
        location.reload();
      })
      .catch((err) => {
        alert("Erro ao cancelar pedido.");
        console.error(err);
      });
  };

  return (
    <div
      className={`bg-white p-3 my-2 rounded shadow-md ${
        isParado ? "border-l-4 border-red-600 bg-red-50" : "border-l-4 border-blue-500"
      }`}
    >
      <div className="font-semibold">
        📦 nº {pedido.numero} - {pedido.nomeCliente}
      </div>
      <div className="text-sm text-gray-600">{tempoTexto}</div>
      <div className="text-xs text-gray-500 mb-2">
        {new Date(pedido.data).toLocaleString("pt-BR")}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAvancar(pedido.numero)}
          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
          title="Avançar"
        >
          <ArrowRight size={18} />
        </button>
        <button
          onClick={cancelarPedido}
          className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
          title="Cancelar"
        >
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
};

export default PedidoCard;
