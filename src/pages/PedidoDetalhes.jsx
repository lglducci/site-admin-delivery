 import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function PedidoDetalhes() {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [searchParams] = useSearchParams();

  const numero = searchParams.get("numero");
  const id_empresa = searchParams.get("id_empresa");

  useEffect(() => {
    async function fetchPedido() {
      try {
        console.log("🔎 Chamando webhook pedido_detalhado:", numero, id_empresa);

        const resp = await fetch(
          `https://webhook.lglducci.com.br/webhook/pedido_detalhado?numero=${numero}&id_empresa=${id_empresa}`
        );

        if (!resp.ok) {
          throw new Error(`Erro ${resp.status} ao buscar pedido`);
        }

        const data = await resp.json();
        console.log("✅ Dados recebidos:", data);

        // se vier dentro de array
        const pedidoData = Array.isArray(data)
          ? data[0]?.pedido_detalhado || data[0]
          : data.pedido_detalhado || data;

        setPedido(pedidoData);
      } catch (e) {
        console.error("❌ Erro ao buscar pedido:", e);
        setErro("Erro ao carregar os dados do pedido.");
      } finally {
        setLoading(false);
      }
    }

    if (numero && id_empresa) fetchPedido();
  }, [numero, id_empresa]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-orange-400">
        🔄 Carregando pedido...
      </div>
    );

  if (erro)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {erro}
      </div>
    );

  if (!pedido)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Nenhum pedido encontrado.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-900 rounded-2xl shadow-lg p-6 border border-orange-500">
        <h1 className="text-2xl font-bold text-orange-400 mb-3">
          🧾 Detalhes do Pedido #{pedido.pedido_id}
        </h1>

        <p className="text-lg font-semibold text-white">
          Cliente: <span className="text-orange-300">{pedido.nome_cliente}</span>
        </p>
        <p className="text-gray-300 mt-1">
          Endereço: {pedido.endereco}, {pedido.bairro}
        </p>
        <p className="text-gray-300 mt-2 whitespace-pre-line">{pedido.resumo}</p>

        <h2 className="text-xl font-bold text-orange-400 mt-6 mb-2">
          🍕 Itens do Pedido
        </h2>

        <div className="space-y-2">
          {pedido.itens?.map((item) => (
            <div
              key={item.numero}
              className="flex justify-between bg-gray-800 rounded-xl p-3 border border-gray-700 shadow hover:border-orange-400 transition"
            >
              <div>
                <strong className="text-orange-300">{item.nome}</strong>
                <div className="text-sm text-gray-400">
                  {item.categoria} {item.tipo ? `(${item.tipo})` : ""}
                  {item.fracionada ? " - fracionada" : ""}
                </div>
              </div>
              <div className="text-right">
                <span className="text-orange-400 font-bold">
                  R$ {item.valor.toFixed(2)}
                </span>
                <div className="text-xs text-gray-400">
                  {item.quantidade} unid.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
