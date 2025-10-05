 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cardapio() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCardapio() {
      try {
        // Pega a empresa do localStorage (salva no login)
        const empresaData = JSON.parse(localStorage.getItem("empresa") || "{}");
        const empresaId = empresaData.id_empresa;

        if (!empresaId) {
          alert("Nenhuma empresa selecionada!");
          return;
        }

        console.log("🔍 Buscando cardápio da empresa:", empresaId);

        const response = await fetch(
          `https://webhook.lglducci.com.br/webhook/cardapio?id_empresa=${empresaId}`
        );

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Retorno inválido do webhook");

        setItens(data);
      } catch (err) {
        console.error("Erro ao carregar cardápio:", err);
        alert("Erro ao carregar cardápio. Veja o console.");
      } finally {
        setLoading(false);
      }
    }

    fetchCardapio();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Carregando cardápio...
      </div>
    );
  }

  if (!itens.length) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Nenhum item encontrado.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📋 Cardápio ({itens.length} itens)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itens.map((item) => (
          <div
            key={item.numero}
            className="bg-white shadow-md rounded-xl overflow-hidden border hover:shadow-lg transition"
          >
            <img
              src={
                item.imagem ||
                "https://placehold.co/400x250/EEE/AAA?text=Sem+Imagem"
              }
              alt={item.nome}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-1 text-gray-900">
                {item.nome}
              </h2>
              <p className="text-gray-600 mb-2 text-sm">
                {item.descricao || "Sem descrição"}
              </p>
              <p className="font-bold text-green-600">
                R$ {item.preco_grande?.toFixed(2) || "0,00"}
              </p>

              <button
                onClick={() => {
                  const empresaData = JSON.parse(
                    localStorage.getItem("empresa") || "{}"
                  );
                  const empresaId = empresaData.id_empresa;

                  if (!empresaId || !item.numero) {
                    alert("Faltam dados da empresa ou número do item!");
                    return;
                  }

                  console.log("➡️ Editar item:", {
                    empresaId,
                    numero: item.numero,
                  });

                  navigate(`/editar-item/${item.numero}`);
                }}
                className="bg-blue-500 text-white mt-3 px-3 py-1 rounded hover:bg-blue-600 w-full"
              >
                ✏️ Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
