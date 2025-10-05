import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EditarItem() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      const empresaId = localStorage.getItem("id_empresa");
      const r = await fetch(`https://webhook.lglducci.com.br/webhook/get_item_cardapio?id_empresa=${empresaId}&numero=${id}`);
      const data = await r.json();
      setItem(data);
      setLoading(false);
    }
    fetchItem();
  }, [id]);

  const handleSave = async () => {
    const empresaId = localStorage.getItem("id_empresa");
    await fetch("https://webhook.lglducci.com.br/webhook/update_item_cardapio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, id_empresa: empresaId }),
    });
    alert("✅ Item atualizado com sucesso!");
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Editar Item #{id}</h2>
      <input
        value={item.nome}
        onChange={(e) => setItem({ ...item, nome: e.target.value })}
        className="border p-2 w-full mb-3"
      />
      <textarea
        value={item.descricao}
        onChange={(e) => setItem({ ...item, descricao: e.target.value })}
        className="border p-2 w-full mb-3"
      />
      <input
        type="number"
        value={item.preco_grande}
        onChange={(e) => setItem({ ...item, preco_grande: e.target.value })}
        className="border p-2 w-full mb-3"
      />
      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        💾 Salvar
      </button>
    </div>
  );
}
