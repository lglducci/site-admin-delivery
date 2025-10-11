 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { key: "pizza", label: "Pizzas", icon: "🍕" },
  { key: "borda", label: "Bordas", icon: "🧀" },
  { key: "bebida", label: "Refrigerantes", icon: "🥤" },
  { key: "item", label: "Itens", icon: "🧩" },
];

export default function Cardapio() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [activeCat, setActiveCat] = useState(null); // <- aba atual
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

          // define categoria inicial: primeira disponível na ordem CATEGORIES
          const lowerCats = new Set(
            data.map((i) => (i.categoria || "").toLowerCase())
          );
          const firstAvail =
            CATEGORIES.find((c) => lowerCats.has(c.key))?.key || "pizza";
          setActiveCat((prev) => prev ?? firstAvail);
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

  // busca global
  const itensFiltrados = itens.filter(
    (i) =>
      i.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      i.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  // categorias disponíveis (não oferece o que não existe)
  const lowerCatsAll = new Set(
    itens.map((i) => (i.categoria || "").toLowerCase())
  );
  const categoriasDisponiveis = CATEGORIES.filter((c) =>
    lowerCatsAll.has(c.key)
  );

  // contadores por categoria (após a busca)
  const contadores = itensFiltrados.reduce((acc, i) => {
    const k = (i.categoria || "").toLowerCase();
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  // itens da aba atual
  const itensCategoria = itensFiltrados.filter(
    (i) => (i.categoria || "").toLowerCase() === (activeCat || "")
  );

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500">Carregando cardápio...</p>
    );

  return (
    <div className="p-6" style={{ backgroundColor: "#0B0B0B", minHeight: "100vh" }}>
      {/* Topo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
          📋 Cardápio
        </h1>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Buscar item..."
            className="flex-1 border border-[#333] bg-[#111] text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFB703] transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button
            onClick={() => navigate("/novo-item")}
            className="bg-[#FFB703] hover:bg-[#E09E00] text-black font-semibold px-4 py-2 rounded-xl transition-all shadow-md"
          >
            ➕ Novo Item
          </button>
        </div>
      </div>

      {/* Abas de categoria (só as disponíveis) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categoriasDisponiveis.map((c) => {
          const isActive = activeCat === c.key;
          const qtd = contadores[c.key] || 0;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCat(c.key)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                isActive
                  ? "bg-[#FFB703] text-black border-[#FFB703]"
                  : "bg-[#161616] text-gray-200 border-[#2a2a2a] hover:bg-[#1f1f1f]"
              }`}
            >
              {c.icon} {c.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-black/20" : "bg-white/10"}`}>
                {qtd}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid de cards (7 por linha no xl) */}
      {itensCategoria.length === 0 ? (
        <p className="text-gray-400">Nada encontrado nesta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          {itensCategoria.map((item) => (
            <div
              key={item.numero}
              className="bg-[#0F0F0F] shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all border border-[#222]"
            >
              <img
                src={item.imagem || "https://placehold.co/400x250?text=Sem+Imagem"}
                alt={item.nome}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-gray-100">
                <h2 className="text-lg font-bold">{item.nome}</h2>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {item.descricao}
                </p>
                <p className="mt-2 font-bold text-[#FFD700]">
                  💰 R$ {item.preco_grande || item.preco || 0}
                </p>
              </div>

              <div className="bg-[#FFB703] hover:bg-[#E09E00] text-black font-semibold px-4 py-2 rounded-b-2xl transition-all shadow-md">
                <button
                  onClick={() => navigate(`/editar-item/${item.numero}`)}
                  className="flex items-center justify-center gap-2 font-medium w-full"
                >
                  ✏️ Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
