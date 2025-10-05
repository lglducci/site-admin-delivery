 import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EditarItem() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      const empresaData = JSON.parse(localStorage.getItem("empresa") || "{}");
      const empresaId = empresaData.id_empresa;

      if (!empresaId || !id) {
        alert("Empresa ou número do item inválido.");
        return;
      }

      console.log("🔎 Buscando item:", { empresaId, id });

      const r = await fetch(
        `https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${empresaId}&numero=${id}`
      );
      const data = await r.json();
      setItem(data);
      setLoading(false);
    }

    fetchItem();
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (!item) return <div>Item não encontrado.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Item #{id}</h1>
      <p>Nome: {item.nome}</p>
      <p>Descrição: {item.descricao}</p>
      <p>Preço grande: R$ {item.preco_grande}</p>
    </div>
  );
}
