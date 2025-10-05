 import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/** Lê id_empresa do localStorage de forma segura */
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

/** Normaliza retorno de API (array ou objeto único) */
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

  /** Busca item do cardápio */
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

  /** Atualiza campo editado */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  /** Envia alterações */
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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">✏️ Editar Item</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-3">
        {/* Campos de visualização */}
        <div>
          <label className="font-semibold">Número</label>
          <input
            value={item.numero ?? ""}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="font-semibold">ID Empresa</label>
          <input
            value={item.id_empresa ?? ""}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        {/* Campos editáveis */}
        <div>
          <label className="font-semibold">Nome</label>
          <input
            name="nome"
            value={item.nome ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Descrição</label>
          <textarea
            name="descricao"
            value={item.descricao ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Tipo</label>
          <input
            name="tipo"
            value={item.tipo ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Categoria</label>
          <input
            name="categoria"
            value={item.categoria ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-semibold">Preço Pequena</label>
            <input
              type="number"
              step="0.01"
              name="preco_pequena"
              value={item.preco_pequena ?? ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="font-semibold">Preço Média</label>
            <input
              type="number"
              step="0.01"
              name="preco_medio"
              value={item.preco_medio ?? ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="font-semibold">Preço Grande</label>
            <input
              type="number"
              step="0.01"
              name="preco_grande"
              value={item.preco_grande ?? ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold">Volume</label>
          <input
            name="volume"
            value={item.volume ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Código</label>
          <input
            name="codigo"
            value={item.codigo ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="font-semibold">Palavras-chave</label>
          <input
            name="palavras_chav"
            value={item.palavras_chav ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="disponivel"
            checked={!!item.disponivel}
            onChange={handleChange}
          />
          <label className="font-semibold">Disponível</label>
        </div>

        <div>
          <label className="font-semibold">Imagem (URL)</label>
          <input
            name="imagem"
            value={item.imagem ?? ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            🔙 Voltar
          </button>

          <button
            onClick={handleSalvar}
            disabled={salvando}
            className={`px-4 py-2 rounded text-white ${
              salvando
                ? "bg-blue-300"
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
