 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ModelosCusto() {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarModelos() {
      try {
        const empresa = JSON.parse(localStorage.getItem("empresa"));
        console.log("🔍 Carregando modelos para empresa:", empresa);
        const r = await fetch(
          `https://webhook.lglducci.com.br/webhook/modelos_custo?id_empresa=${empresa.id_empresa}`
        );
        const data = await r.json();
        console.log("📦 Dados recebidos:", data);
        if (Array.isArray(data)) setModelos(data);
      } catch (err) {
        console.error("Erro ao carregar modelos:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarModelos();
  }, []);

  const salvarAlteracoes = async () => {
    try {
      const empresa = JSON.parse(localStorage.getItem("empresa"));
      console.log("💾 Salvando modelos:", modelos);
      const r = await fetch(
        "https://webhook.lglducci.com.br/webhook/modelos_custo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_empresa: empresa.id_empresa,
            modelos,
          }),
        }
      );
      if (!r.ok) throw new Error("Erro ao salvar");
      alert("✅ Modelos salvos com sucesso!");
      navigate(-1);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("❌ Falha ao salvar alterações");
    }
  };

  if (loading) return <div className="text-white p-4">⏳ Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl border border-orange-500 p-6">
        <h1 className="text-2xl font-bold text-orange-400 mb-6">
          💰 Modelos de Custo
        </h1>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-orange-400 border-b border-orange-500">
              <th className="p-2">Grupo</th>
              <th className="p-2">Descrição</th>
              <th className="p-2 text-center">Margem Mínima</th>
              <th className="p-2 text-center">Margem Máxima</th>
            </tr>
          </thead>
          <tbody>
            {modelos.map((m, i) => (
              <tr key={m.id_referencia} className="border-b border-gray-700">
                <td className="p-2 font-semibold text-orange-300">
                  {m.nome_grupo}
                </td>
                <td className="p-2 text-sm text-gray-300">{m.descricao}</td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={m.margem_min}
                    step="0.01"
                    className="w-20 bg-gray-900 text-center border border-gray-600 rounded p-1"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setModelos((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, margem_min: val } : x
                        )
                      );
                    }}
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={m.margem_max}
                    step="0.01"
                    className="w-20 bg-gray-900 text-center border border-gray-600 rounded p-1"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setModelos((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, margem_max: val } : x
                        )
                      );
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
          >
            ⬅️ Voltar
          </button>

          <button
            onClick={salvarAlteracoes}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition"
          >
            💾 Salvar e Sair
          </button>
        </div>
      </div>
    </div>
  );
}
