 import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      try {
        const empresa = JSON.parse(localStorage.getItem("empresa") || "{}");
        const empresaId = empresa.id_empresa;
        const numero = id && id !== "undefined" ? id : localStorage.getItem("ultimo_item_editado");

        if (!empresaId || !numero) {
          setErro("Empresa ou número inválido");
          setLoading(false);
          return;
        }

        const url = `https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${empresaId}&numero=${numero}`;
        console.log("🔍 Buscando:", url);

        const res = await fetch(url);
        const txt = await res.text();
        if (!txt) throw new Error("Resposta vazia do servidor");

        const data = JSON.parse(txt);
        console.log("✅ Dados recebidos:", data);

        setItem(data);
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar o item");
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  if (loading) return <div className="p-6">Carregando...</div>;
  if (erro) return <div className="p-6 text-red-600">{erro}</div>;
  if (!item) return <div className="p-6">Item não encontrado.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button
        onClick={() => navigate("/cardapio")}
        className="mb-4 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
      >
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Editar Item #{id}
      </h1>

      <div className="bg-white shadow p-4 rounded">
        <p><strong>Nome:</strong> {item.nome}</p>
        <p><strong>Descrição:</strong> {item.descricao}</p>
        <p><strong>Preço grande:</strong> R$ {item.preco_grande}</p>
        <p><strong>Categoria:</strong> {item.categoria}</p>
        {item.imagem && (
          <img
            src={item.imagem}
            alt={item.nome}
            className="mt-3 w-full rounded-lg shadow"
          />
        )}
      </div>
    </div>
  );
}
