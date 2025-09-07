 import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetch("https://n8n.lglducci.com.br/webhook-test/pedidos")
      .then((res) => res.json())
      .then((data) => setPedidos(data))
      .catch((err) => console.error("Erro ao buscar pedidos:", err));
  }, []);

  const avancarStatus = async (pedido) => {
    const response = await fetch("https://n8n.lglducci.com.br/webhook-test/avancar-pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pedido.numero }),
    });
    const result = await response.json();
    if (result.success) {
      setPedidos((prev) =>
        prev.map((p) => (p.numero === pedido.numero ? { ...p, status: result.novoStatus } : p))
      );
    }
  };

  const colunas = ["Recebido", "Produção", "Entrega", "Concluído"];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Painel de Pedidos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {colunas.map((status) => (
          <div key={status} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h2 className="font-semibold mb-2">{status}</h2>
            {pedidos
              .filter((p) => p.status === status)
              .map((pedido) => (
                <div key={pedido.numero} className="mb-2 p-2 border rounded">
                  <p><strong>#{pedido.numero}</strong> - {pedido.nomeCliente}</p>
                  {status !== "Concluído" && (
                    <button
                      onClick={() => avancarStatus(pedido)}
                      className="mt-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Avançar
                    </button>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
