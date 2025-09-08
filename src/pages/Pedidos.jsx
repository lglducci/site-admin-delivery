 import React, { useEffect, useState } from "react";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetch("https://webhook.lglducci.com.br/webhook/pedidos")
      .then((r) => r.json())
      .then((dados) => {
        setPedidos(Array.isArray(dados) ? dados : []);
      })
      .catch((err) => {
        console.error("Erro ao carregar pedidos:", err);
      });
  }, []);

  const avancarPedido = (numero) => {
    fetch("https://webhook.lglducci.com.br/webhook/avancar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero }),
    })
      .then(() => {
        alert(`Pedido ${numero} avançado!`);
        location.reload();
      })
      .catch(() => alert("Erro ao avançar pedido"));
  };

  const cancelarPedido = (numero) => {
    if (!confirm("Cancelar o pedido?")) return;
    fetch("https://webhook.lglducci.com.br/webhook/cancelar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero }),
    })
      .then(() => {
        alert(`Pedido ${numero} cancelado!`);
        location.reload();
      })
      .catch(() => alert("Erro ao cancelar pedido"));
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">📦 Pedidos Atuais</h1>
      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        pedidos.map((pedido) => {
          const data = new Date(pedido.data);
          const minutos = Math.floor((new Date() - data) / 60000);
          const parado = minutos > 15;

          return (
            <div
              key={pedido.numero}
              className={`mb-4 p-4 rounded shadow border-l-4 ${
                parado
                  ? "bg-red-100 border-red-500"
                  : "bg-white dark:bg-gray-800 border-blue-500"
              }`}
            >
              <div className="font-bold">📦 Pedido nº {pedido.numero}</div>
              <div>👤 Cliente: {pedido.nomeCliente}</div>
              <div>📅 Data: {data.toLocaleString("pt-BR")}</div>
              <div className="mt-2">
                {minutos < 1
                  ? "⏱️ Pedido recente"
                  : `⏱️ Aguardando há ${minutos} minuto${
                      minutos > 1 ? "s" : ""
                    }`}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                  onClick={() => avancarPedido(pedido.numero)}
                >
                  ➤ Avançar
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                  onClick={() => cancelarPedido(pedido.numero)}
                >
                  ✖ Cancelar
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
