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

        if (Array.isArray(data)) setItens(data);
        else console.error("Formato inesperado:", data);
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

  if (loading)
    return <p className="p-6 text-center text-gray-500">Carregando cardápio...</p>;

  return (
  
     <div className="p-6" style={{ backgroundColor: "#FDF6EC", minHeight: "100vh" }}>
      {/* Topo com título e barra de busca */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-[#1A1F2B]">
          📋 Cardápio
        </h1>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Buscar item..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFB703] transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button
            onClick={() => navigate("/novo-item")}
            className="bg-[#FFB703] hover:bg-[#E09E00] text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-md"
          >
            ➕ Novo Item
          </button>
        </div>
      </div>
{/* Cards */}
{/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"> */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">


  {itensFiltrados.map((item) => (
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
        <h2 className="text-lg font-bold text-[#F5E3D0]">{item.nome}</h2>
        <p className="text-sm text-[#E8D5C0] mt-1 line-clamp-2">
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
    </div>
  );
}     
