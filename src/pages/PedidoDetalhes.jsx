 import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export default function PedidoDetalhes() {
  const { numero } = useParams(); // /detalhes/:numero
  const [searchParams] = useSearchParams();
  const id_empresa =
    searchParams.get("id_empresa") ||
    localStorage.getItem("id_empresa") ||
    JSON.parse(localStorage.getItem("empresa") || "{}")?.id_empresa ||
    0;

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!numero || !id_empresa) {
      console.warn("❌ Parâmetros inválidos:", { numero, id_empresa });
      return;
    }

    console.log(`🔎 Buscando detalhes: numero=${numero}, id_empresa=${id_empresa}`);

    fetch(`https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${id_empresa}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        const txt = await r.text();
        setDados(txt);
      })
      .catch((err) => {
        console.error("Erro ao buscar detalhes:", err);
        setDados("<p>Erro ao carregar detalhes do pedido.</p>");
      })
      .finally(() => setLoading(false));
  }, [numero, id_empresa]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <h2>🔄 Carregando detalhes do pedido...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-2xl font-bold text-orange-400 mb-4">
        📦 Pedido nº {numero}
      </h1>

      <div
        className="bg-white text-black p-4 rounded-xl shadow-xl max-w-3xl mx-auto"
        dangerouslySetInnerHTML={{ __html: dados }}
      ></div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => window.close()}
          className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white font-semibold"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
