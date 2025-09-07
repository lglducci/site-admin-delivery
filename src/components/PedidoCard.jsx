// src/components/PedidoCard.jsx

import React from "react";
import { format, isToday } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const PedidoCard = ({ pedido, onAvancar }) => {
  const data = new Date(pedido.create_at);
  const horario = format(data, "HH:mm", { locale: ptBR });
  const dia = isToday(data)
    ? "Hoje"
    : format(data, "dd/MM/yyyy", { locale: ptBR });

  const valor = Number(pedido.valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

  return (
    <div className="bg-gray-100 p-3 rounded mb-3 flex items-center justify-between text-sm font-normal">
      <div className="flex-1">
        <span className="text-blue-900 font-medium mr-2">
          <a href="#" className="hover:underline">
            nº {pedido.pedido_id}
          </a>
        </span>
        <span className="text-gray-700 mr-2">– {pedido.nome}</span>
        <span className="text-gray-600 mr-2">{valor}</span>
        <span className="text-gray-600">{dia}, {horario}</span>
      </div>
      <button
        onClick={() => onAvancar(pedido.pedido_id)}
        className="text-blue-800 text-xs hover:underline whitespace-nowrap ml-4"
      >
        Avançar →
      </button>
    </div>
  );
};

export default PedidoCard;
