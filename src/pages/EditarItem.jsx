 
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/** Pega id_empresa do localStorage de forma robusta */
function getIdEmpresa() {
  try {
    const direto = localStorage.getItem("id_empresa");
    if (direto && Number(direto)) return Number(direto);

    const raw = localStorage.getItem("empresa");
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj?.id_empresa) return Number(obj.id_empresa);
      if (obj?.idEmpresa)  return Number(obj.idEmpresa);
    }
  } catch (e) {
    console.error("Erro lendo empresa do localStorage:", e);
  }
  return null;
}

/** Normaliza retorno: aceita objeto único ou array e pega o primeiro válido */
function pickFirstItem(data) {
  if (!data) return null;
  const obj = Array.isArray(data) ? data[0] : data;
  if (!obj || typeof obj !== "object") return null;
  return obj;
}

export default function EditarItem() {
  // Aceita tanto /editar-item/:numero quanto /editar-item/:id
  const params = useParams();
  const numeroParam = params?.numero ?? params?.id ?? null;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarItem() {
      const idEmpresa = getIdEmpresa();
      const numero = Number(numeroParam);

      // Validações específicas (sem alert genérico)
      if (!idEmpresa) {
        setErro("Empresa não encontrada no navegador. Abra o cardápio e clique em ✏️ Editar novamente (isso grava a empresa).");
        setLoading(false);
        return;
      }
      if (!Number.isFinite(numero) || numero <= 0) {
        setErro("Número do item inválido na URL.");
        setLoading(false);
        return;
      }

      try {
        const url = `https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${idEmpresa}&numero=${numero}`;
        const r = await fetch(url);
        if (!r.ok) {
          setErro(`Falha ao carregar item (HTTP ${r.status}).`);
          setLoading(false);
          return;
        }

        const data = await r.json();
        const obj = pickFirstItem(data);

        if (!obj) {
          setErro("Item não encontrado.");
        } else {
          setItem(obj);
        }
      } catch (err) {
        console.error("Erro ao carregar item:", err);
        setErro("Erro ao carregar item.");
      } finally {
        setLoading(false);
      }
    }

    carregarItem();
  }, [numeroParam]);

  if (loading) return <p className="p-6 text-center">Carregando...</p>;
  if (erro)    return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">✏️ Editar Item</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-red-600 dark:text-red-400">
        {erro}
      </div>
      <button
        onClick={() => window.history.back()}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        🔙 Voltar
      </button>
    </div>
  );

  if (!item) return <p className="p-6 text-center">Item não encontrado.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">✏️ Editar Item</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <p><strong>Nome:</strong> {item.nome ?? "—"}</p>
        <p><strong>Descrição:</strong> {item.descricao ?? "—"}</p>
        <p><strong>Preço grande:</strong> R$ {item.preco_grande ?? "—"}</p>

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
