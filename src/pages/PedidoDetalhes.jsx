 import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export default function PedidoDetalhes() {
  const { numero } = useParams();
  const [searchParams] = useSearchParams();
  const id_empresa = searchParams.get("id_empresa");

  const [pedido, setPedido] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchDetalhes = async () => {
      try {
        if (!numero || !id_empresa) return;

        const url = `https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${id_empresa}`;
        console.log("🔎 Buscando:", url);

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`);
        const data = await resp.text();

        setPedido(data);
      } catch (err) {
        console.error("Erro ao buscar pedido:", err);
        setPedido(`<p style="color:red;">Erro ao carregar o pedido.</p>`);
      } finally {
        setCarregando(false);
      }
    };

    fetchDetalhes();
  }, [numero, id_empresa]);

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-screen text-white bg-black">
        <h2>Carregando pedido nº {numero}...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-orange-400 mb-4">
          Pedido nº {numero}
        </h1>

        {/* 🔥 Exibe o HTML que veio do webhook */}
        <div
          className="bg-white text-black p-4 rounded-lg"
          dangerouslySetInnerHTML={{ __html: pedido }}
        />

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => window.close()}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
