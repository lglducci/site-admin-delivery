 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ModelosCusto() {
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  // 🔹 Carregar modelos no início
  useEffect(() => {
    async function carregarModelos() {
      try {
        const empresa = JSON.parse(localStorage.getItem("empresa"));
        if (!empresa || !empresa.id_empresa) {
          setErro("❌ Empresa não encontrada no localStorage.");
          setLoading(false);
          return;
        }

        console.log("🔍 Buscando modelos:", empresa.id_empresa);
        const response = await fetch(
          `https://webhook.lglducci.com.br/webhook/modelos_custo?id_empresa=${empresa.id_empresa}`
        );

        if (!response.ok) throw new Error("Erro HTTP " + response.status);

        const data = await response.json();
        console.log("📦 Dados recebidos:", data);

        if (Array.isArray(data) && data.length > 0) {
          setModelos(data);
        } else {
          setErro("⚠️ Nenhum modelo encontrado para esta empresa.");
        }
      } catch (e) {
        console.error("Erro ao buscar modelos:", e);
        setErro("❌ Erro ao conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    }

    carregarModelos();
  }, []);

  // 🔹 Função de salvar alterações
  const salvarAlteracoes = async () => {
    try {
      const empresa = JSON.parse(localStorage.getItem("empresa"));
      if (!empresa || !empresa.id_empresa) {
        alert("❌ Empresa não encontrada.");
        return;
      }

      console.log("💾 Enviando para webhook:", modelos);
      const response = await fetch(
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

      if (!response.ok) throw new Error("Erro HTTP " + response.status);

      alert("✅ Modelos salvos com sucesso!");
      navigate(-1);
    } catch (e) {
      console.error("Erro ao salvar:", e);
      alert("❌ Falha ao salvar alterações.");
    }
  };

  // 🔹 Layouts condicionais
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-400 text-lg">
        ⏳ Carregando modelos de custo...
      </div>
    );

  if (erro)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-400 text-lg">
        {erro}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white"
        >
          🔄 Tentar novamente
        </button>
      </div>
    );

  // 🔹 Interface principal
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-8">
      <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl border border-orange-500 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-orange-400">
            💰 Modelos de Custo
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg"
          >
            ⬅️ Voltar
          </button>
        </div>

        <div className="overflow-x-auto">
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
                <tr
                  key={m.id_referencia}
                  className="border-b border-gray-700 hover:bg-gray-700/40 transition"
                >
                  <td className="p-2 font-semibold text-orange-300">
                    {m.nome_grupo}
                  </td>
                  <td className="p-2 text-sm text-gray-300">{m.descricao}</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={m.margem_min}
                      step="0.01"
                      className="w-24 bg-gray-900 text-center border border-gray-600 rounded p-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                      className="w-24 bg-gray-900 text-center border border-gray-600 rounded p-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={salvarAlteracoes}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg font-semibold text-white shadow-lg transition"
          >
            💾 Salvar e Sair
          </button>
        </div>
      </div>
    </div>
  );
}
