 import React, { useEffect, useState } from "react";

export default function KdsView() {
  const [pedidos, setPedidos] = useState([]);
  const [erro, setErro] = useState("");

  // Lê empresa do localStorage (Login.jsx já grava isso)
  const empresaData = (() => {
    try {
      return JSON.parse(localStorage.getItem("empresa") || "{}");
    } catch {
      return {};
    }
  })();
  const idEmpresa = empresaData?.id_empresa;

  // 🔒 Se não tiver empresa, avisa o usuário (impede fetch sem id)
  useEffect(() => {
    if (!idEmpresa) {
      setErro("Sem empresa no contexto. Faça login novamente.");
    }
  }, [idEmpresa]);

  // 🔄 Atualiza a lista a cada 5s (filtra por status) e passa id_empresa
  useEffect(() => {
    if (!idEmpresa) return;

    const fetchPedidos = async () => {
      try {
        const resp = await fetch(
          `https://webhook.lglducci.com.br/webhook/pedidos?id_empresa=${encodeURIComponent(
            idEmpresa
          )}`
        );
        const data = await resp.json();
 
       const emProducao = (Array.isArray(data) ? data : []).filter((p) => {
         const s = (p.status || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
         return ["producao", "em preparo", "emproducao"].includes(s);
       });

       
        setPedidos(emProducao);
        setErro("");
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
        setErro("Falha ao carregar pedidos da cozinha.");
      }
    };

    fetchPedidos();
    const interval = setInterval(fetchPedidos, 5000);
    return () => clearInterval(interval);
  }, [idEmpresa]);

  // ✅ Marca pedido como pronto informando também o id_empresa
  const marcarPronto = async (numero) => {
    if (!idEmpresa) return;

    try {
      await fetch("https://webhook.lglducci.com.br/webhook/pedido_pronto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, id_empresa: idEmpresa }),
      });

      // Otimista: remove da UI
      setPedidos((prev) => prev.filter((p) => p.numero !== numero));
    } catch (err) {
      console.error("Erro ao marcar como pronto:", err);
      setErro("Não foi possível marcar como pronto.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold mb-1 text-center text-yellow-400">🍳 KDS - Cozinha</h1>
      <p className="text-center text-sm text-gray-400 mb-6">
        {empresaData?.nome_empresa
          ? `Empresa: ${empresaData.nome_empresa} (ID ${idEmpresa})`
          : "Empresa não definida"}
      </p>

      {erro && <div className="mb-4 text-center text-red-400">{erro}</div>}

      {!idEmpresa ? (
        <p className="text-center text-gray-400">Faça login para carregar os pedidos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidos.length === 0 ? (
            <p className="text-center text-gray-400 col-span-full">
              Nenhum pedido em preparo 🍕
            </p>
          ) : (
            pedidos.map((pedido) => (
              <div key={pedido.numero} className="bg-zinc-800 rounded-2xl p-4 shadow-lg">
                <h2 className="text-2xl font-bold text-yellow-400">Pedido nº {pedido.numero}</h2>
                <p className="text-gray-300">{pedido.nome_cliente}</p>
                <p className="mt-2 text-sm text-gray-400 whitespace-pre-line">{pedido.itens}</p>
                <button
                  onClick={() => marcarPronto(pedido.numero)}
                  className="bg-green-600 hover:bg-green-700 w-full py-3 mt-4 rounded-xl font-bold"
                >
                  ✅ Pronto
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
