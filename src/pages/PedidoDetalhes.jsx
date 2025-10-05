 import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export default function PedidoDetalhes() {
  const { numero } = useParams();
  const [searchParams] = useSearchParams();
  const id_empresa =
    searchParams.get("id_empresa") ||
    localStorage.getItem("id_empresa") ||
    JSON.parse(localStorage.getItem("empresa") || "{}")?.id_empresa ||
    0;

  const [html, setHtml] = useState("<p>Carregando...</p>");

  useEffect(() => {
    if (!numero || !id_empresa) return;

    const url = `https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${id_empresa}`;
    console.log("🔗 Buscando:", url);

    fetch(url)
      .then((r) => r.text())
      .then((txt) => setHtml(txt))
      .catch((err) => {
        console.error("Erro:", err);
        setHtml("<p>Erro ao carregar pedido.</p>");
      });
  }, [numero, id_empresa]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-orange-400 mb-4">
        Pedido nº {numero}
      </h1>
      <div
        className="bg-white text-black p-4 rounded-lg shadow-xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
