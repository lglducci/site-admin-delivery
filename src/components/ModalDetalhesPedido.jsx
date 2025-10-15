 import React from "react";

const ModalDetalhesPedido = ({ open, onClose, numero, idEmpresa }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-11/12 max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Detalhes do Pedido nº {numero}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Dados do pedido carregados de {idEmpresa || "—"}.
        </p>
        <button
          onClick={onClose}
          className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ModalDetalhesPedido;
