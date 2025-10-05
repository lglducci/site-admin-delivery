 import React, { useEffect, useState } from "react";

export default function Cardapio() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarCardapio() {
      try {
        const empresa = JSON.parse(localStorage.getItem("empresa"));
        if (!empresa?.id_empresa) {
          alert("Nenhuma empresa encontrada. Faça login novamente.");
          return;
        }

        const r = await fetch(`https://webhook.lglducci.com.br/webhook/cardapio?id_empresa=${empresa.id_empresa}`);
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

  if (loading) return <p className="p-6 text-center">Carregando cardápio...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Cardápio</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {itens.map((item) => (
          <div
            key={item.numero}
            className="bg-white shadow-md rounded-lg p-4 dark:bg-gray-800"
          >
            <img
              src={item.imagem || "https://placehold.co/400x250?text=Sem+Imagem"}
              alt={item.nome}
              className="w-full h-40 object-cover rounded"
            />
            <h2 className="text-lg font-bold mt-2">{item.nome}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.descricao}
            </p>
            <p className="mt-1 font-semibold">
              💰 R$ {item.preco_grande || item.preco || 0}
            </p>

            <button
              onClick={() => {
                const empresa = JSON.parse(localStorage.getItem("empresa"));
                if (!empresa?.id_empresa || !item.numero) {
                  alert("Dados insuficientes para editar o item!");
                  return;
                }

                // Salva os dados no localStorage para a tela de edição
                localStorage.setItem("id_empresa", empresa.id_empresa);
                localStorage.setItem("numero_item", item.numero);

                // Redireciona
                window.location.href = `/editar-item/${item.numero}`;
              }}
              className="mt-3 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              ✏️ Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
