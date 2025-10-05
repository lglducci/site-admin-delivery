 import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PedidoDetalhes() {
  const { numero } = useParams();
  const [pedido, setPedido] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const id_empresa =
      localStorage.getItem("id_empresa") ||
      JSON.parse(localStorage.getItem("empresa") || "{}")?.id_empresa ||
      0;

    fetch(
      `https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${id_empresa}`
    )
      .then((r) => r.json())
      .then((dados) => {
        if (dados && dados.length > 0) setPedido(dados[0]);
        else setErro("Pedido não encontrado.");
      })
      .catch(() => setErro("Erro ao carregar pedido."));
  }, [numero]);

  if (erro)
    return (
      <div className="p-6 text-center text-red-500 font-semibold">{erro}</div>
    );

  if (!pedido)
    return (
      <div className="p-6 text-center text-gray-400">Carregando pedido...</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-orange-500">
        <h1 className="text-2xl font-bold text-orange-500 mb-4">
          Pedido nº {numero}
        </h1>
        <p className="mb-2 text-sm text-gray-600">
          <strong>Cliente:</strong> {pedido.nome}
        </p>
        <p className="mb-2 text-sm text-gray-600">
          <strong>Bairro:</strong> {pedido.bairro}
        </p>
        <p className="mb-2 text-sm text-gray-600">
          <strong>Endereço:</strong> {pedido.endereço}
        </p>
        <p className="mb-2 text-sm text-gray-600">
          <strong>Forma de pagamento:</strong>{" "}
          {pedido.tipo_cobranca || "—"}
        </p>
        <p className="mt-4 whitespace-pre-line">{pedido.resumo}</p>
      </div>
    </div>
  );
}
