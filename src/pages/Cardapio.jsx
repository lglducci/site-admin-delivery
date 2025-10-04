 import React, { useEffect, useState } from "react";
import { useEmpresa } from "../context/EmpresaContext";

export default function Cardapio() {
  const { empresa, carregado } = useEmpresa();
  const [itens, setItens] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // só executa depois que o contexto estiver carregado
    if (!carregado) return;

    const buscar = async () => {
      try {
        const id_empresa = empresa?.id_empresa;
        if (!id_empresa) {
          setErro("Nenhuma empresa logada");
          return;
        }

        console.log("🔎 Buscando cardápio para empresa:", id_empresa);

        const res = await fetch(
          `https://webhook.lglducci.com.br/webhook/cardapio?id_empresa=${id_empresa}`
        );
        if (!res.ok) throw new Error("Erro ao buscar cardápio");

        const data = await res.json();
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        setItens(lista);
      } catch (e) {
        console.error("Erro ao carregar cardápio:", e);
        setErro("Erro ao carregar cardápio");
      }
    };

    buscar();
  }, [carregado, empresa]);

  if (!carregado) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <p>Carregando empresa...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <p>{erro}</p>
      </div>
    );
  }

  if (!itens.length) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <p>Carregando cardápio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        Cardápio de {empresa?.nome_empresa || "Minha Pizzaria"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {itens.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            <img
              src={
                item.imagem ||
                "https://placehold.co/400x250?text=Sem+Imagem"
              }
              alt={item.nome || "Sem nome"}
              className="w-full h-48 object-cover rounded-md mb-3"
            />
            <h2 className="text-lg font-semibold">{item.nome}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {item.descricao || "Sem descrição"}
            </p>
            <p className="text-lg font-bold text-green-600">
              R$
              {item.preco_grande ||
                item.preco ||
                (item.tamanhos?.[0]?.preco ?? 0)}
            </p>
            <button
              onClick={() =>
                window.open(
                  `https://webhook.lglducci.com.br/webhook/editar_item?id=${item.id}`,
                  "_blank"
                )
              }
              className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
            >
              ✏️ Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
