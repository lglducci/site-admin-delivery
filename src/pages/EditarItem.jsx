  import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
    console.error("Erro lendo empresa:", e);
  }
  return null;
}

function pickFirstItem(data) {
  if (!data) return null;
  return Array.isArray(data) ? data[0] : data;
}

export default function EditarItem() {
  const params = useParams();
  const numeroParam = params?.numero ?? params?.id ?? null;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarItem() {
      const idEmpresa = getIdEmpresa();
      const numero = Number(numeroParam);

      if (!idEmpresa || !numero) {
        setErro("Empresa ou número inválido.");
        setLoading(false);
        return;
      }

      try {
        const url = `https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${idEmpresa}&numero=${numero}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Erro HTTP ${r.status}`);
        const data = await r.json();
        const obj = pickFirstItem(data);
        if (!obj) throw new Error("Item não encontrado.");
        setItem(obj);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar item.");
      } finally {
        setLoading(false);
      }
    }

    carregarItem();
  }, [numeroParam]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setItem((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSalvar() {
    if (!item) return;
    setSalvando(true);

    try {
      const response = await fetch(
        "https://webhook.lglducci.com.br/webhook/update_item_cardapio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }
      );

      const result = await response.json().catch(() => ({}));
      if (response.ok && (result.success || result.ok || !result.error)) {
        alert("✅ Item atualizado com sucesso!");
      } else {
        alert("❌ Falha ao atualizar item.");
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("❌ Erro de conexão ao salvar item.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading)
    return <p className="p-6 text-center">Carregando item...</p>;
  if (erro)
    return (
      <div className="p-6 text-center text-red-600">{erro}</div>
    );
  if (!item)
    return <p className="p-6 text-center">Item não encontrado.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
        ✏️ Editar Item
      </h1>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg space-y-5 border border-gray-200 dark:border-gray-700 transition-all duration-200">
        {/* Campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Número
            </label>
            <input
              value={item.numero ?? ""}
              disabled
              className="w-full p-3 border rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              ID Empresa
            </label>
            <input
              value={item.id_empresa ?? ""}
              disabled
              className="w-full p-3 border rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Nome
            </label>
            <input
              name="nome"
              value={item.nome ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={item.descricao ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl resize-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <input
              name="tipo"
              value={item.tipo ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <input
              name="categoria"
              value={item.categoria ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Preço Pequena
            </label>
            <input
              type="number"
              name="preco_pequena"
              value={item.preco_pequena ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Preço Média
            </label>
            <input
              type="number"
              name="preco_medio"
              value={item.preco_medio ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Preço Grande
            </label>
            <input
              type="number"
              name="preco_grande"
              value={item.preco_grande ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Volume
            </label>
            <input
              name="volume"
              value={item.volume ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Código
            </label>
            <input
              name="codigo"
              value={item.codigo ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Palavras-chave
            </label>
            <input
              name="palavras_chav"
              value={item.palavras_chav ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="disponivel"
              checked={!!item.disponivel}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-400 accent-blue-500"
            />
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Disponível
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Imagem (URL)
            </label>
            <input
              name="imagem"
              value={item.imagem ?? ""}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow"
          >
            🔙 Voltar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className={`px-6 py-2 rounded-xl text-white shadow transition-all duration-200 ${
              salvando
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {salvando ? "Salvando..." : "💾 Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
