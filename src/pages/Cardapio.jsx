 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cardapio() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarCardapio() {
      try {
        const empresa = JSON.parse(localStorage.getItem("empresa"));
        if (!empresa?.id_empresa) {
          alert("Nenhuma empresa encontrada. Faça login novamente.");
          return;
        }

        const r = await fetch(
          `https://webhook.lglducci.com.br/webhook/cardapio?id_empresa=${empresa.id_empresa}`
        );
        const data = await r.json();

        if (Array.isArray(data)) {
          setItens(data);
        } else {
          console.error("Formato inesperado:", data);
        }
      } catch (err) {
        console.error("Erro ao carregar cardápio:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarCardapio();
  }, []);

  const itensFiltrados = itens.filter((i) =>
    i.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    i.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) return <p className="p-6 text-center">Carregando cardápio...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">📋 Cardápio</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍 Procurar item..."
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button
            onClick={() => navigate("/novo-item")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            ➕ Novo Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {itensFiltrados.map((item) => (
          <div
            key={item.numero}
            className="bg-white shadow-md rounded-2xl p-4 dark:bg-gray-800"
          >
            <img
              src={item.imagem || "https://placehold.co/400x250?text=Sem+Imagem"}
              alt={item.nome}
              className="w-full h-40 object-cover rounded-lg"
            />
            <h2 className="text-lg font-bold mt-2">{item.nome}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.descricao}</p>
            <p className="mt-1 font-semibold">💰 R$ {item.preco_grande || item.preco || 0}</p>

            <button
              onClick={() => navigate(`/editar-item/${item.numero}`)}
              className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              ✏️ Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
