 import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export default function PedidoDetalhes() {
  const { numero: numeroParam } = useParams();
  const [searchParams] = useSearchParams();

  // Tenta pegar o número e id_empresa de várias fontes
  const numero =
    numeroParam || searchParams.get("numero") || localStorage.getItem("numero_pedido");
  const id_empresa =
    searchParams.get("id_empresa") ||
    localStorage.getItem("id_empresa") ||
    JSON.parse(localStorage.getItem("empresa") || "{}")?.id_empresa;

  const [pedidoHtml, setPedidoHtml] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchDetalhes = async () => {
      if (!numero || !id_empresa) {
        console.warn("🚫 Dados insuficientes para buscar o pedido:", {
          numero,
          id_empresa,
        });
        setCarregando(false);
        return;
      }

      try {
        const url = `https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${id_empresa}`;
        console.log("🔎 Buscando:", url);

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`);
        const data = await resp.text();

        setPedidoHtml(data);
      } catch (err) {
        console.error("❌ Erro ao buscar pedido:", err);
        setPedidoHtml("<p style='color:red;'>Erro ao carregar o pedido.</p>");
      } finally {
        setCarregando(false);
      }
    };

    fetchDetalhes();
  }, [numero, id_empresa]);

  if (carregando)
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <h2>Carregando pedido...</h2>
      </div>
    );

  if (!pedidoHtml)
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <h2>Nenhum pedido encontrado.</h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-orange-400 mb-4">
          Pedido nº {numero}
        </h1>

        <div
          className="bg-white text-black p-4 rounded-lg shadow"
          dangerouslySetInnerHTML={{ __html: pedidoHtml }}
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
