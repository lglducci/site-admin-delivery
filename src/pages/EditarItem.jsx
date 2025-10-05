 import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EditarItem() {
  const { numero } = useParams(); // número do item vindo da rota
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarItem() {
      try {
        const id_empresa = localStorage.getItem("id_empresa");
        if (!id_empresa || !numero) {
          alert("Empresa ou número do item inválido.");
          return;
        }

        const r = await fetch(
          `https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${id_empresa}&numero=${numero}`
        );
        const data = await r.json();

        if (data) {
          setItem(data);
        } else {
          console.error("Item não encontrado:", data);
        }
      } catch (err) {
        console.error("Erro ao carregar item:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarItem();
  }, [numero]);

  if (loading) return <p className="p-6 text-center">Carregando...</p>;
  if (!item) return <p className="p-6 text-center">Item não encontrado.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">✏️ Editar Item</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <p><strong>Nome:</strong> {item.nome}</p>
        <p><strong>Descrição:</strong> {item.descricao}</p>
        <p><strong>Preço grande:</strong> R$ {item.preco_grande}</p>

        <button
          onClick={() => window.history.back()}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          🔙 Voltar
        </button>
      </div>
    </div>
  );
}
