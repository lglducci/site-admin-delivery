import React from "react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Painel de Pedidos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">📥 Recebido</div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">👨‍🍳 Produção</div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">🚚 Entrega</div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">✅ Concluído</div>
      </div>
    </div>
  );
}
