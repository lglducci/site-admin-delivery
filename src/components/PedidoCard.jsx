 import React from "react";

export default function PedidoCard({ pedido, onAvancar }) {
  const hoje = new Date().toDateString();
  const dataPedido = new Date(pedido.data);
  const ehHoje = dataPedido.toDateString() === hoje;

  const hora = dataPedido.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const mostrarData = ehHoje ? "hoje" : dataPedido.toLocaleDateString("pt-BR");

  return (
    <div className="flex justify-between items-center px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 mb-2 text-sm font-medium text-gray-800 dark:text-white">
      <span className="text-blue-900 dark:text-blue-300">
       
       //<a href="#" className="hover:underline">nº {pedido.numero}</a> - {pedido.nomeCliente}
        <a 
           href={`https://n8n.lglducci.com.br/webhook/pedido-html?numero=${pedido.numero}`}
        //   href={`https://n8n.lglducci.com.br/webhook-test/pedido-html?numero=${pedido.numero}`}
            
           target="_blank"
           rel="noopener noreferrer"
           className="hover:underline"
         >
           nº {pedido.numero}
         </a>


       
       
      </span>
      <span className="text-gray-500 dark:text-gray-300 text-xs">
        {mostrarData} às {hora}
      </span>
      <button
        onClick={() => onAvancar(pedido.numero)}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-white text-xs ml-2"
      >
        Avançar
      </button>
    </div>
  );
}





