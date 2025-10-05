 import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PedidoDetalhes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pega os parâmetros da URL
  const query = new URLSearchParams(location.search);
  const numero = query.get("numero");
  const id_empresa =
    query.get("id_empresa") ||
    localStorage.getItem("id_empresa") ||
    JSON.parse(localStorage.getItem("empresa") || "{}")?.id_empresa ||
    0;

  useEffect(() => {
    const carregar = async () => {
      try {
        const resp = await fetch(
          `https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${id_empresa}`
        );
        const data = await resp.json();
        setPedido(data[0]);
      } catch (e) {
        console.error("Erro ao buscar pedido:", e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [numero, id_empresa]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white bg-black">
        <h2>Carregando pedido...</h2>
      </div>
    );

  if (!pedido)
    return (
      <div className="flex justify-center items-center h-screen text-red-600 bg-black">
        <h2>Pedido não encontrado!</h2>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
      <div className="bg-orange-200 w-full max-w-2xl rounded-2xl shadow-2xl p-8 border border-orange-400">
        <h1 className="text-2xl font-bold text-center text-orange-800 mb-6">
          📋 Detalhes do Pedido nº {numero}
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="font-bold text-gray-700">🏠 Endereço:</h2>
            <p className="text-gray-800">{pedido.endereço || "—"}</p>
            <p className="text-gray-800">
              Bairro: {pedido.bairro || "—"}
            </p>
          </div>
          <div>
            <h2 className="font-bold text-gray-700">
              💳 Pagamento & Entrega:
            </h2>
            <p className="text-gray-800">
              Forma: {pedido.tipo_cobranca || "—"}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
          <h2 className="font-bold text-gray-700 mb-2">🧾 Resumo:</h2>
          <pre className="whitespace-pre-wrap text-gray-800 text-sm">
            {pedido.resumo || "—"}
          </pre>
        </div>

        <div className="flex justify-between text-gray-800 font-bold mb-4">
          <span>💰 Total:</span>
          <span>
            R$ {Number(pedido.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="text-gray-700 mb-4">
          <h2 className="font-bold">💬 Comentário:</h2>
          <p>{pedido.comentario || "—"}</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all"
          >
            ⬅️ Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
