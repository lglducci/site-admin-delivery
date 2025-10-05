 import React from "react";

export default function PedidoCard({ pedido }) {
  const dataPedido = new Date(pedido.data);
  const hora = dataPedido.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const empresaId =
    localStorage.getItem("id_empresa") ||
    JSON.parse(localStorage.getItem("empresa") || "{}")?.id_empresa ||
    0;

  const handleAvancar = async () => {
    try {
      const resposta = await fetch(
        "https://webhook.lglducci.com.br/webhook/avancar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numero: pedido.numero,
            id_empresa: empresaId,
          }),
        }
      );

      if (!resposta.ok) throw new Error("Erro ao avançar pedido");
      alert(`✅ Pedido nº ${pedido.numero} avançado com sucesso!`);
      window.location.reload();
    } catch {
      alert("❌ Erro ao avançar o pedido.");
    }
  };

  return (
    <div className="flex justify-between items-center px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 mb-2 text-sm font-medium text-gray-800 dark:text-white">
      <div className="flex-1">
        <span className="text-blue-900 dark:text-blue-300">
          <a
            
           href={`/detalhes?numero=${pedido.numero}&id_empresa=${empresaId}`}
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
        {hora}
      </div>
      <button
        onClick={handleAvancar}
        className="text-orange-500 hover:text-orange-700 text-xs font-bold"
      >
        ▶️ Avançar
      </button>
    </div>
  );
}

