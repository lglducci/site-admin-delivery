 import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function PedidoDetalhes() {
  const [searchParams] = useSearchParams();
  const numero = searchParams.get("numero");
  const id_empresa = searchParams.get("id_empresa");
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    if (!numero || !id_empresa) return;

    const carregar = async () => {
      try {
        const r = await fetch(
          `https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${id_empresa}`
        );
        const data = await r.json();
        console.log("🔎 Detalhes do pedido:", data);
        setPedido(data[0]);
      } catch (err) {
        console.error("❌ Erro ao buscar detalhes:", err);
      }
    };

    carregar();
  }, [numero, id_empresa]);

  if (!pedido) return <p className="text-white p-6">Carregando pedido...</p>;

  return (
    <div className="p-6 text-gray-900 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Pedido nº {numero} — Empresa {id_empresa}
      </h1>
      <p><strong>Cliente:</strong> {pedido.nome}</p>
      <p><strong>Endereço:</strong> {pedido.endereço}</p>
      <p><strong>Bairro:</strong> {pedido.bairro}</p>
      <p><strong>Resumo:</strong></p>
      <pre className="bg-gray-100 p-3 rounded">{pedido.resumo}</pre>
    </div>
  );
}
