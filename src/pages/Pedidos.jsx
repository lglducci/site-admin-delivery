import React from "react";
import PedidoCard from "../components/PedidoCard";

const Pedidos = () => {
  const pedidos = []; // Substitua com os dados reais ou simulação

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pedidos Atuais</h1>
      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        pedidos.map((pedido, index) => (
          <PedidoCard key={index} pedido={pedido} />
        ))
      )}
    </div>
  );
};

export default Pedidos;
