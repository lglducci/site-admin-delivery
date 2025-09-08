 // src/pages/Pedidos.jsx
import React from "react";
import { Ban, ArrowRight } from "lucide-react";

const Pedidos = () => {
  const pedidos = [
    {
      numero: 204,
      cliente: "Luis Gustavo Landucci",
      data: "2025-09-08T16:15:00",
    },
    {
      numero: 203,
      cliente: "João Pedro",
      data: "2025-09-08T16:10:00",
    },
  ];

  const formatData = (data) => {
    const dt = new Date(data);
    return dt.toLocaleDateString("pt-BR") + " às " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📦 Pedidos Atuais
      </h1>

      {pedidos.map((pedido) => (
        <div key={pedido.numero} className="bg-white shadow-md rounded-lg p-4 mb-4 border-l-4 border-blue-500">
          <p className="text-lg font-bold">Pedido nº {pedido.numero}</p>
          <p className="text-gray-700">👤 Cliente: {pedido.cliente}</p>
          <p className="text-gray-700">📅 Data: {formatData(pedido.data)}</p>
          <p className="text-gray-700">⏱️ Pedido recente</p>
          <div className="mt-3 flex gap-2">
            <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 flex items-center gap-1">
              <ArrowRight size={16} /> Avançar
            </button>
            <button className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 flex items-center gap-1">
              <Ban size={16} /> Cancelar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Pedidos;
