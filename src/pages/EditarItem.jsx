 import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      const empresaData = JSON.parse(localStorage.getItem("empresa") || "{}");
      const empresaId = empresaData.id_empresa;
      const numero = id || localStorage.getItem("ultimo_item_editado"); // fallback

      if (!empresaId || !numero) {
        alert("Empresa ou número do item inválido.");
        return;
      }

      console.log("🔎 Buscando item:", { empresaId, numero });

      try {
        const r = await fetch(
          `https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${empresaId}&numero=${numero}`
        );
        const text = await r.text();

        if (!text) throw new Error("Resposta vazia do servidor.");
        const data = JSON.parse(text);
        setItem(data);
      } catch (err) {
        console.error("Erro ao buscar item:", err);
        alert("Erro ao buscar o item.");
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  if (loading) return <div className="p-6 text-lg">Carregando...</div>;
  if (!item) return <div className="p-6 text-lg">Item não encontrado.</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/cardapio")}
        className="mb-4 bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
      >
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold mb-4">Editar Item #{id}</h1>

      <div className="space-y-3">
        <p><strong>Nome:</strong> {item.nome}</p>
        <p><strong>Descrição:</strong> {item.descricao}</p>
        <p><strong>Preço grande:</strong> R$ {item.preco_grande}</p>
        <p><strong>Categoria:</strong> {item.categoria}</p>
        <p><strong>Imagem:</strong> {item.imagem}</p>
      </div>
    </div>
  );
}
