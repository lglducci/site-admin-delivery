 import React, { useEffect, useState } from "react";
import { useEmpresa } from "../context/EmpresaContext";

export default function Cardapio() {
  const { empresa, carregado } = useEmpresa();
  const [itens, setItens] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("TODOS");
  const [erro, setErro] = useState(null);

  const categoriasFixas = ["TODOS", "PIZZA", "ESFIRRA", "REFRIGERANTE", "ÁGUA", "ALCOÓLICA", "BORDA"];

  useEffect(() => {
    if (!carregado || !empresa?.id_empresa) return;

    const carregarCardapio = async () => {
      try {
        const res = await fetch(
          `https://webhook.lglducci.com.br/webhook/cardapio?id_empresa=${empresa.id_empresa}`
        );
        if (!res.ok) throw new Error("Erro ao buscar cardápio");
        const data = await res.json();
        setItens(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Erro:", err);
        setErro("Erro ao carregar cardápio.");
      }
    };

    carregarCardapio();
  }, [empresa, carregado]);

  const itensFiltrados =
    categoriaSelecionada === "TODOS"
      ? itens
      : itens.filter(
          (i) => i.categoria?.toUpperCase() === categoriaSelecionada
        );

  if (!carregado)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Carregando empresa...
      </div>
    );

  if (erro)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {erro}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🍕 Cardápio
        </h1>
        <span className="text-sm text-gray-500">
          Itens: {itensFiltrados.length}
        </span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categoriasFixas.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaSelecionada(cat)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
              categoriaSelecionada === cat
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {itensFiltrados.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 overflow-hidden border border-gray-100"
          >
            <img
              src={
                item.imagem ||
                "https://placehold.co/400x250?text=Sem+Imagem"
              }
              alt={item.nome}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="font-bold text-lg">{item.nome}</h2>
              <p className="text-sm text-gray-600 mb-3">
                {item.descricao || "Sem descrição"}
              </p>

              {/* Tamanhos */}
              <div className="flex flex-col gap-2 text-sm">
                {item.tamanhos?.map((t) => (
                  <div
                    key={t.nome}
                    className="bg-blue-50 border border-blue-200 rounded px-3 py-1 flex justify-between items-center"
                  >
                    <span>{t.nome === "M" ? "Média" : t.nome === "G" ? "Grande" : t.nome}</span>
                    <span className="font-bold text-blue-700">
                      R$ {t.preco?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  window.open(
                    `https://webhook.lglducci.com.br/webhook/editar_item?id=${item.id}`,
                    "_blank"
                  )
                }
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
              >
                ✏️ Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {itensFiltrados.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          Nenhum item encontrado
        </div>
      )}
    </div>
  );
}
