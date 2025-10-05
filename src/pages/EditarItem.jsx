 import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/** Função para ler id_empresa */
function getIdEmpresa() {
  try {
    const direto = localStorage.getItem("id_empresa");
    if (direto && Number(direto)) return Number(direto);
    const raw = localStorage.getItem("empresa");
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj?.id_empresa) return Number(obj.id_empresa);
      if (obj?.idEmpresa) return Number(obj.idEmpresa);
    }
  } catch (e) {
    console.error("Erro lendo empresa do localStorage:", e);
  }
  return null;
}

export default function EditarItem() {
  const { numero } = useParams();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      const id_empresa = getIdEmpresa();
      if (!id_empresa || !numero) {
        setErro("Empresa ou número inválido.");
        setLoading(false);
        return;
      }
      try {
        const r = await fetch(
          `https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${id_empresa}&numero=${numero}`
        );
        const data = await r.json();
        if (data) setForm(data);
        else setErro("Item não encontrado.");
      } catch (err) {
        setErro("Erro ao carregar item.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [numero]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  async function salvar() {
    try {
      const r = await fetch("https://webhook.lglducci.com.br/webhook/update_item_cardapio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (data?.success) alert("✅ Item atualizado com sucesso!");
      else alert("Erro ao atualizar o item.");
    } catch (err) {
      alert("Falha ao salvar.");
    }
  }

  if (loading)
    return <p className="p-6 text-center text-gray-500">Carregando...</p>;
  if (erro)
    return (
      <div className="p-6 text-red-600 bg-red-50 text-center rounded-xl shadow">
        {erro}
      </div>
    );

  return (
    <div
      className="min-h-screen p-6 flex flex-col items-center"
      style={{ backgroundColor: "#FDF6EC" }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-[#1A1F2B]">
          ✏️ Editar Item
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Número
            </label>
            <input
              name="numero"
              value={form.numero || ""}
              readOnly
              className="w-full p-2 border rounded-xl bg-gray-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              ID Empresa
            </label>
            <input
              name="id_empresa"
              value={form.id_empresa || ""}
              readOnly
              className="w-full p-2 border rounded-xl bg-gray-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">
              Nome
            </label>
            <input
              name="nome"
              value={form.nome || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={form.descricao || ""}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Tipo</label>
            <input
              name="tipo"
              value={form.tipo || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Categoria
            </label>
            <input
              name="categoria"
              value={form.categoria || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Preço Pequena
            </label>
            <input
              name="preco_pequena"
              value={form.preco_pequena || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Preço Média
            </label>
            <input
              name="preco_medio"
              value={form.preco_medio || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Preço Grande
            </label>
            <input
              name="preco_grande"
              value={form.preco_grande || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Volume
            </label>
            <input
              name="volume"
              value={form.volume || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Código
            </label>
            <input
              name="codigo"
              value={form.codigo || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-xl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">
              Palavras-chave
            </label>
            <input
              name="palavras_chav"
              value={form.palavras_chav || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-xl transition-all"
          >
            🔙 Voltar
          </button>

          <button
            onClick={salvar}
            className="bg-[#2E8B57] hover:bg-[#237045] text-white font-semibold px-5 py-2 rounded-xl transition-all shadow-md"
          >
            💾 Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
