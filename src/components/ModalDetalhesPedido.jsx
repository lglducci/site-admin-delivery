 import React, { useEffect, useState } from "react";

export default function ModalDetalhesPedido({ open, onClose, numero, idEmpresa }) {
  const [detalhes, setDetalhes] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open || !numero) return;

    const carregar = async () => {
      try {
        const url = `https://webhook.lglducci.com.br/webhook/pedido_detalhes?numero=${numero}&id_empresa=${idEmpresa}`;
        const resp = await fetch(url);
        const data = await resp.text();
        setDetalhes(data || "Nenhum detalhe encontrado.");
        setErro("");
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar detalhes do pedido.");
      }
    };

    carregar();
  }, [open, numero, idEmpresa]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Detalhes do Pedido nº {numero}
        </h2>

        {erro && <p className="text-red-500 mb-4">{erro}</p>}

        {!erro && !detalhes && (
          <p className="text-gray-500">Carregando detalhes do pedido...</p>
        )}

        {detalhes && (
          <div
            className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: detalhes }}
          />
        )}
      </div>
    </div>
  );
}
