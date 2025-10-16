 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* 🎨 Tema azul (coerente com Login e KDS) */
const THEME = {
  // página
  pageBg: "#0e2a3a",

  // painel grande (topo)
  panelBg: "#17384a",
  panelBorder: "rgba(255,159,67,0.30)",

  // cards
  cardBg: "#254759",
  cardBorder: "rgba(255,159,67,0.30)",
  cardShadow: "0 6px 20px rgba(0,0,0,0.25)",

  // tipografia e acentos
  title: "#ff9f43",
  text: "#e8eef2",
  textMuted: "#bac7cf",

  // botões
  btnDark: "#2a2f39",
  btnDarkText: "#e5e7eb",
  btnOrange: "#ff9f43",
  btnOrangeText: "#1b1e25",
};

const CATEGORIES = [
  { key: "pizza", label: "Pizzas", icon: "🍕" },
  { key: "borda", label: "Bordas", icon: "🧀" },
  { key: "bebida", label: "Refrigerantes", icon: "🥤" },
  { key: "item", label: "Itens", icon: "🧩" },
  { key: "esfirra", label: "Esfirra", icon: "" },
];

export default function Cardapio() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [activeCat, setActiveCat] = useState(null);
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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: THEME.pageBg, color: THEME.textMuted }}
      >
        Carregando cardápio…
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: THEME.pageBg, color: THEME.text }}
    >
      {/* Topo em painel */}
      <div
        className="rounded-xl p-4 md:p-5 border shadow-lg mb-6"
        style={{ background: THEME.panelBg, borderColor: THEME.panelBorder }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <h1
            className="text-3xl font-bold flex items-center gap-2"
            style={{ color: THEME.title }}
          >
            📋 Cardápio
          </h1>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="🔍 Buscar item..."
              className="flex-1 rounded-xl px-4 py-2 focus:outline-none transition-all"
              style={{
                background: THEME.btnDark,
                color: THEME.btnDarkText,
                border: `1px solid ${THEME.panelBorder}`,
              }}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button
              onClick={() => navigate("/novo-item")}
              className="font-semibold px-4 py-2 rounded-xl transition-all shadow-md"
              style={{ background: THEME.btnOrange, color: THEME.btnOrangeText }}
            >
              ➕ Novo Item
            </button>
          </div>
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
              className="px-3 py-2 rounded-xl text-sm font-semibold transition-all border"
              style={{
                background: isActive ? THEME.btnOrange : THEME.btnDark,
                color: isActive ? THEME.btnOrangeText : THEME.btnDarkText,
                borderColor: THEME.panelBorder,
              }}
            >
              {c.icon} {c.label}
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: isActive ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.12)",
                  color: isActive ? THEME.btnOrangeText : THEME.text,
                }}
              >
                {qtd}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid de cards */}
      {itensCategoria.length === 0 ? (
        <p style={{ color: THEME.textMuted }}>Nada encontrado nesta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          {itensCategoria.map((item) => (
            <div
              key={item.numero}
              className="rounded-2xl overflow-hidden transition-all border hover:shadow-2xl"
              style={{
                background: THEME.cardBg,
                borderColor: THEME.cardBorder,
                boxShadow: THEME.cardShadow,
              }}
            >
              <img
                src={item.imagem || "https://placehold.co/400x250?text=Sem+Imagem"}
                alt={item.nome}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <h2 className="text-lg font-bold" style={{ color: THEME.title }}>
                  {item.nome}
                </h2>
                <p className="text-sm mt-1 line-clamp-2" style={{ color: THEME.textMuted }}>
                  {item.descricao}
                </p>
                <p className="mt-2 font-bold" style={{ color: THEME.text }}>
                  💰 R$ {item.preco_grande || item.preco || 0}
                </p>
              </div>

              <div className="rounded-b-2xl">
                <button
                  onClick={() => navigate(`/editar-item/${item.numero}`)}
                  className="flex items-center justify-center gap-2 font-medium w-full px-4 py-2 rounded-b-2xl transition-colors"
                  style={{ background: THEME.btnOrange, color: THEME.btnOrangeText }}
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
