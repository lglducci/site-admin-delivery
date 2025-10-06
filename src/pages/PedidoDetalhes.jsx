 import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function PedidoDetalhes() {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const numero = searchParams.get("numero");
  const id_empresa = searchParams.get("id_empresa");

useEffect(() => {
  if (!numero || !id_empresa) return;

  const fetchPedido = async () => {
    try {
      const resp = await   fetch(`/api/pedido_detalhado?numero=${numero}&id_empresa=${id_empresa}` ,
 
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

 





     

      if (!resp.ok) throw new Error("Falha ao carregar pedido");
      const data = await resp.json();
      setPedido(data);
    } catch (e) {
      console.error("Erro ao buscar pedido:", e);
    } finally {
      setLoading(false);
    }
  };

  fetchPedido();
}, [numero, id_empresa]);


  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-white bg-gray-900">
        <h2>Carregando pedido...</h2>
      </div>
    );

  if (!pedido)
    return (
      <div className="flex items-center justify-center h-screen text-white bg-gray-900">
        <h2>Pedido não encontrado.</h2>
      </div>
    );

  const itens = pedido.itens || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 flex justify-center items-start p-6">
      <div className="bg-orange-100 text-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl p-8 border border-orange-500 mt-10">
        <h1 className="text-2xl font-bold text-center text-orange-700 mb-6 drop-shadow-md">
          🧾 Detalhes do Pedido nº {numero} — Empresa {id_empresa}
        </h1>

        <div className="bg-white rounded-xl p-6 shadow-inner border border-gray-200">
          <p>
            <strong>Cliente:</strong> {pedido.nome_cliente}
          </p>
          <p>
            <strong>Endereço:</strong> {pedido.endereco}
          </p>
          <p>
            <strong>Bairro:</strong> {pedido.bairro}
          </p>

          <hr className="my-4 border-orange-300" />

          <h2 className="text-lg font-semibold text-orange-700 mb-3">
            🍕 Itens do Pedido
          </h2>

          <div className="space-y-3">
            {itens.map((i, index) => (
              <div
                key={index}
                className="bg-orange-50 border border-orange-300 p-4 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <p className="font-semibold text-gray-800">
                  {i.nome}{" "}
                  <span className="text-sm text-gray-500">
                    ({i.categoria})
                  </span>
                </p>
                {i.tipo && (
                  <p className="text-sm text-gray-600">
                    Tipo: <strong>{i.tipo}</strong>
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  Quantidade: {i.quantidade}{" "}
                  {i.fracionada && (
                    <span className="ml-2 text-orange-600 font-medium">
                      Fracionada
                    </span>
                  )}
                </p>
                <p className="font-semibold text-orange-700 mt-1">
                  💰 R$ {Number(i.valor).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-orange-200 rounded-lg p-4 text-center font-semibold text-gray-800 shadow-inner">
            💳 Forma de Pagamento:{" "}
            {pedido.tipo_cobranca || "Não informado"}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 rounded-xl font-semibold shadow-lg transition-all"
          >
            ⬅️ Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
