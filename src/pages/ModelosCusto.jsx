 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ModelosCusto() {
  const [msg, setMsg] = useState("🟡 Iniciando componente...");
  const [dados, setDados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregar() {
      try {
        setMsg("🧩 Entrou no useEffect");

        const empresa = JSON.parse(localStorage.getItem("empresa"));
        if (!empresa || !empresa.id_empresa) {
          setMsg("❌ Empresa não encontrada no localStorage");
          return;
        }

        setMsg(`📡 Chamando webhook da empresa ${empresa.id_empresa}...`);

        const url = `https://webhook.lglducci.com.br/webhook/modelos_custo?id_empresa=${empresa.id_empresa}`;
        const r = await fetch(url);
        const data = await r.text();

        setMsg(`✅ Webhook respondeu!\nURL: ${url}\nResposta bruta:\n${data}`);

        try {
          const json = JSON.parse(data);
          setDados(json);
        } catch {
          setMsg("⚠️ Resposta não era JSON válido:\n" + data);
        }
      } catch (e) {
        setMsg("❌ Erro fatal: " + e.message);
      }
    }

    carregar();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <pre className="text-left bg-gray-900 p-4 rounded-xl max-w-3xl overflow-auto whitespace-pre-wrap">
        {msg}
      </pre>

      {Array.isArray(dados) && dados.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800 rounded-xl w-full max-w-3xl">
          <h2 className="text-orange-400 mb-2">📋 Dados recebidos:</h2>
          <ul>
            {dados.map((d, i) => (
              <li key={i} className="border-b border-gray-700 py-1">
                {JSON.stringify(d)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg"
      >
        ⬅️ Voltar
      </button>
    </div>
  );
}
