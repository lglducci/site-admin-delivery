 import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const response = await fetch("https://n8n.lglducci.com.br/webhook-test/pedidos"); // webhook de teste
      // const response = await fetch("https://webhook.lglducci.com.br/webhook/pedidos"); // produção
      const data = await response.json();
      setPedidos(data);
    };

    fetchPedidos();
  }, []);

  const avancarPedido = async (numero) => {
    await fetch("https://n8n.lglducci.com.br/webhook-test/avancar-pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero }),
    });
    window.location.reload(); // simples: recarrega pedidos
  };

  const formatarValor = (valor) =>
    valor?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatarData = (data) =>
    new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  const colunas = ["Recebido", "Produção", "Entrega", "Concluído"];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Painel de Pedidos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {colunas.map((status) => (
          <div key={status} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">{status}</h2>
            {pedidos
              .filter((p) => p.status === status)
              .map((p) => (
                <div
                  key={p.numero}
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2 text-sm"
                >
                  <p><strong>#{p.numero}</strong> - {p.nomeCliente}</p>
                  <p>{formatarValor(p.valor)} | {formatarData(p.data)}</p>
                  <button
                    className="mt-1 text-xs text-blue-400 hover:underline"
                    onClick={() => avancarPedido(p.numero)}
                  >
                    Avançar →
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
