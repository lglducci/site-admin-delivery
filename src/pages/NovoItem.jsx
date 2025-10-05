import React, { useState } from "react";

export default function NovoItem() {
  const id_empresa = localStorage.getItem("id_empresa") || 1;
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    tipo: "",
    preco_pequena: "",
    preco_medio: "",
    preco_grande: "",
    palavras_chav: "",
    volume: "",
    codigo: "",
    imagem: "",
    disponivel: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  async function salvarItem() {
    try {
      const r = await fetch("https://webhook.lglducci.com.br/webhook/update_item_cardapio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id_empresa,
          novo: true
        })
      });

      const data = await r.json();
      if (data?.success) alert("✅ Novo item criado com sucesso!");
      else alert("Erro ao salvar item.");
    } catch (err) {
      console.error(err);
      alert("Falha ao salvar item.");
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🆕 Novo Item</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-3">
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" className="border w-full p-2 rounded" />
        <textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição" className="border w-full p-2 rounded" />
        <input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Categoria" className="border w-full p-2 rounded" />
        <input name="preco_grande" value={form.preco_grande} onChange={handleChange} placeholder="Preço Grande" className="border w-full p-2 rounded" />
        <input name="imagem" value={form.imagem} onChange={handleChange} placeholder="URL da Imagem" className="border w-full p-2 rounded" />
        <button onClick={salvarItem} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          💾 Salvar
        </button>
      </div>
    </div>
  );
}
