 import React, { useEffect, useState } from "react";

export default function Cardapio() {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");

  useEffect(() => {
    const empresaId = localStorage.getItem("id_empresa");
    if (!empresaId) return;

    fetch(`https://webhook.lglducci.com.br/webhook/cardapio?id_empresa=${empresaId}`)
      .then((res) => res.json())
      .then((data) => {
        // Garante que é array
        if (Array.isArray(data)) {
          setItens(data);
        } else if (data && typeof data === "object") {
          setItens(Object.values(data));
        }
      })
      .catch((err) => console.error("Erro ao carregar cardápio:", err));
  }, []);

  const categorias = [
    "TODOS",
    "PIZZA",
    "ESFIRRA",
    "REFRIGERANTE",
    "ÁGUA",
    "ALCOÓLICA",
    "BORDA",
  ];

  const itensFiltrados =
    filtro === "TODOS"
      ? itens
      : itens.filter(
          (i) => i.categoria?.toUpperCase() === filtro.toUpperCase()
        );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">🍕 Cardápio</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              filtro === cat
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de itens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {itensFiltrados.length === 0 ? (
          <div className="col-span-4 text-center text-gray-500">
            Nenhum item encontrado
          </div>
        ) : (
          itensFiltrados.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
            >
           
             <img
             src={item.imagem || "https://placehold.co/400x250?text=Sem+Imagem"}
             alt={item.nome || "Sem nome"}
             className="w-full h-48 object-cover rounded-md"
           />



             
              <div className="p-4">
                <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1">
                  {item.nome}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {item.descricao}
                </p>

                {/* preços dinâmicos */}
                <div className="flex flex-col gap-1 text-sm mb-3">
                  {item.tamanhos && item.tamanhos.length > 0 ? (
                    item.tamanhos.map((t) => (
                      <span key={t.nome}>
                        {t.nome}: R$ {t.preco?.toFixed(2)}
                      </span>
                    ))
                  ) : (
                    <>
                      {item.preco_medio && (
                        <span>Média: R$ {item.preco_medio}</span>
                      )}
                      {item.preco_grande && (
                        <span>Grande: R$ {item.preco_grande}</span>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={() =>
                    window.open(
                      `https://webhook.lglducci.com.br/webhook/editar_item?id=${item.id}`,
                      "_blank"
                    )
                  }
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                  ✏️ Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
