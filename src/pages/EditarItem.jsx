 import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditarItem() {
  const { id } = useParams(); // número do item vindo da URL
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchItem() {
      try {
        const empresaId = localStorage.getItem("id_empresa");
        if (!empresaId || !id) {
          setErro("Empresa ou número do item inválido.");
          setLoading(false);
          return;
        }

        const url = `https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${empresaId}&numero=${id}`;
        console.log("🔗 Buscando:", url);

        const resp = await fetch(url);
        const text = await resp.text();

        if (!text) {
          setErro("Nenhum dado retornado do servidor.");
          setLoading(false);
          return;
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          setErro("Erro ao processar JSON do servidor.");
          setLoading(false);
          return;
        }

        setItem(data);
      } catch (err) {
        console.error("Erro ao buscar item:", err);
        setErro("Erro de conexão com o servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  // Função para salvar alterações
  async function handleSalvar(e) {
    e.preventDefault();

    const empresaId = localStorage.getItem("id_empresa");
    if (!empresaId || !item?.numero) {
      alert("Erro: Empresa ou número inválido.");
      return;
    }

    try {
      const resp = await fetch("https://webhook.lglducci.com.br/webhook/salvar_item_cardapio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_empresa: empresaId,
          numero: item.numero,
          nome: item.nome,
          descricao: item.descricao,
          preco_grande: item.preco_grande,
          preco_medio: item.preco_medio,
          preco_pequena: item.preco_pequena,
        }),
      });

      if (!resp.ok) throw new Error("Erro ao salvar alterações");

      alert("Item atualizado com sucesso!");
      navigate("/cardapio");
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    }
  }

  if (loading) return <div className="p-6 text-gray-700">Carregando...</div>;
  if (erro) return <div className="p-6 text-red-500">{erro}</div>;
  if (!item) return <div className="p-6 text-gray-700">Item não encontrado.</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Editar Item #{item.numero}</h1>

      <form onSubmit={handleSalvar} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Nome</label>
          <input
            type="text"
            value={item.nome || ""}
            onChange={(e) => setItem({ ...item, nome: e.target.value })}
            className="w-full p-2 rounded border dark:bg-gray-700"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Descrição</label>
          <textarea
            value={item.descricao || ""}
            onChange={(e) => setItem({ ...item, descricao: e.target.value })}
            className="w-full p-2 rounded border dark:bg-gray-700"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-semibold">Pequena</label>
            <input
              type="number"
              value={item.preco_pequena || ""}
              onChange={(e) => setItem({ ...item, preco_pequena: e.target.value })}
              className="w-full p-2 rounded border dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Média</label>
            <input
              type="number"
              value={item.preco_medio || ""}
              onChange={(e) => setItem({ ...item, preco_medio: e.target.value })}
              className="w-full p-2 rounded border dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Grande</label>
            <input
              type="number"
              value={item.preco_grande || ""}
              onChange={(e) => setItem({ ...item, preco_grande: e.target.value })}
              className="w-full p-2 rounded border dark:bg-gray-700"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
