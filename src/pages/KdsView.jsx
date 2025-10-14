import React, { useEffect, useState } from "react";

export default function KdsView() {
  const [pedidos, setPedidos] = useState([]);

  // 🔄 Atualiza a cada 5s
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const resp = await fetch("https://webhook.lglducci.com.br/webhook/pedidos");
        const data = await resp.json();
        // Filtra apenas pedidos em produção
        const emProducao = data.filter(p => p.status === "Produção" || p.status === "Em preparo");
        setPedidos(emProducao);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
      }
    };

    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const marcarPronto = async (numero) => {
    try {
      await fetch("https://webhook.lglducci.com.br/webhook/pedido_pronto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero }),
      });
      setPedidos((prev) => prev.filter((p) => p.numero !== numero));
    } catch (err) {
      console.error("Erro ao marcar como pronto:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">🍳 KDS - Cozinha</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidos.length === 0 ? (
          <p className="text-center text-gray-400">Nenhum pedido em preparo 🍕</p>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.numero} className="bg-zinc-800 rounded-2xl p-4 shadow-lg">
              <h2 className="text-2xl font-bold text-yellow-400">Pedido nº {pedido.numero}</h2>
              <p className="text-gray-300">{pedido.nome_cliente}</p>
              <p className="mt-2 text-sm text-gray-400">{pedido.itens}</p>
              <button
                onClick={() => marcarPronto(pedido.numero)}
                className="bg-green-600 hover:bg-green-700 w-full py-3 mt-4 rounded-xl font-bold"
              >
                ✅ Pronto
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
