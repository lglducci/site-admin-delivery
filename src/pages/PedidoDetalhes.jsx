 import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PedidoDetalhes() {
  const { numero } = useParams();
  const navigate = useNavigate();
  const [htmlPedido, setHtmlPedido] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const empresaId = localStorage.getItem("id_empresa");
    if (!empresaId || !numero) {
      setErro("Pedido ou empresa não identificado.");
      return;
    }

    fetch(`https://webhook.lglducci.com.br/webhook/pedido-html?numero=${numero}&id_empresa=${empresaId}`)
      .then((r) => (r.ok ? r.text() : Promise.reject("Erro na resposta")))
      .then((html) => setHtmlPedido(html))
      .catch(() => setErro("Erro ao carregar detalhes do pedido."));
  }, [numero]);

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-red-500">
        <p>{erro}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!htmlPedido) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Carregando detalhes do pedido nº {numero}...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-900 text-white p-6"
      dangerouslySetInnerHTML={{ __html: htmlPedido }}
    />
  );
}
