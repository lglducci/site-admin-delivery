 // src/pages/EditarItem.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/* Helper: pega id_empresa do localStorage */
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

/* Helper: retorna o primeiro item, caso a API devolva array */
function pickFirstItem(data) {
  if (!data) return null;
  return Array.isArray(data) ? data[0] : data;
}

export default function EditarItem() {
  const params = useParams();
  const numeroParam = params?.numero ?? params?.id ?? null;

  const [item, setItem] = useState(null);
  const [modelos, setModelos] = useState([]);          // << opções do select
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
        // 1) Carrega o item
        const url = `https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${idEmpresa}&numero=${numero}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Erro HTTP ${r.status}`);
        const data = await r.json();
        const obj = pickFirstItem(data);
        if (!obj) throw new Error("Item não encontrado.");
        setItem(obj);

        // 2) Carrega modelos de custo (para o dropdown)
        try {
          const rMod = await fetch(
            `https://webhook.lglducci.com.br/webhook/modelos_custo?id_empresa=${idEmpresa}`,
            { cache: "no-store" }
          );
          const mods = await rMod.json().catch(() => []);
          setModelos(Array.isArray(mods) ? mods : []);
        } catch {
          setModelos([]);
        }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando item…
      </div>
    );
  }
  if (erro) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-400">{erro}</div>
      </div>
    );
  }
  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Item não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white py-10 px-4">
      <div className="w-full max-w-4xl mx-auto bg-orange-500/15 border border-orange-400 rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-orange-300 text-center">
          ✏️ Editar Item
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Número */}
          <div>
            <label className="block text-sm font-semibold mb-1">Número</label>
            <input
              value={item.numero ?? ""}
              disabled
              className="w-full px-3 py-2 rounded-xl bg-gray-800 text-gray-300 border border-gray-700"
            />
          </div>

          {/* ID Empresa */}
          <div>
            <label className="block text-sm font-semibold mb-1">ID Empresa</label>
            <input
              value={item.id_empresa ?? ""}
              disabled
              className="w-full px-3 py-2 rounded-xl bg-gray-800 text-gray-300 border border-gray-700"
            />
          </div>

          {/* Nome */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Nome</label>
            <input
              name="nome"
              value={item.nome ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Descrição */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Descrição</label>
            <textarea
              name="descricao"
              value={item.descricao ?? ""}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo</label>
            <input
              name="tipo"
              value={item.tipo ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold mb-1">Categoria</label>
            <input
              name="categoria"
              value={item.categoria ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Modelo de Custo (id_referencia) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Modelo de Custo</label>
            <select
              value={item.id_referencia ?? ""}
              onChange={(e) =>
                setItem((prev) => ({
                  ...prev,
                  id_referencia: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            >
              <option value="">— selecione —</option>
              {modelos.map((m) => (
                <option key={m.id_referencia} value={m.id_referencia}>
                  {m.nome_grupo} · mín {Number(m.margem_min ?? 0).toFixed(2)} / máx{" "}
                  {Number(m.margem_max ?? 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Preços */}
          <div>
            <label className="block text-sm font-semibold mb-1">Preço Pequena</label>
            <input
              type="number"
              name="preco_pequena"
              value={item.preco_pequena ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Preço Média</label>
            <input
              type="number"
              name="preco_medio"
              value={item.preco_medio ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Preço Grande</label>
            <input
              type="number"
              name="preco_grande"
              value={item.preco_grande ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-semibold mb-1">Volume</label>
            <input
              name="volume"
              value={item.volume ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Código */}
          <div>
            <label className="block text-sm font-semibold mb-1">Código</label>
            <input
              name="codigo"
              value={item.codigo ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Palavras-chave */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Palavras-chave</label>
            <input
              name="palavras_chave"
              value={item.palavras_chave ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Disponível */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disponivel"
              checked={!!item.disponivel}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-400 accent-orange-500"
            />
            <label className="text-sm font-semibold">Disponível</label>
          </div>

          {/* Imagem */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Imagem (URL)</label>
            <input
              name="imagem"
              value={item.imagem ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md text-white"
          >
            🔙 Voltar
          </button>

          <button
            onClick={handleSalvar}
            disabled={salvando}
            className={`px-6 py-2 rounded-xl text-white shadow-md ${
              salvando ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {salvando ? "Salvando..." : "💾 Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
