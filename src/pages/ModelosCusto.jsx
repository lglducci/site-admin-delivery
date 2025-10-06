 // src/pages/ModelosCusto.jsx
import React, { useState } from "react";

export default function ModelosCusto() {
  const [log, setLog] = useState("🟢 Tela montou. Clique em 'Testar webhook'.");

  const testarWebhook = async () => {
    try {
      setLog("📡 Chamando /api/webhook/modelos_custo?id_empresa=2 ...");
      const r = await fetch("/api/webhook/modelos_custo?id_empresa=2");
      const txt = await r.text();
      setLog((prev) => prev + `\n✅ Status: ${r.status}\n— Resposta (até 1k):\n${txt.slice(0,1000)}`);
    } catch (e) {
      setLog((prev) => prev + `\n❌ Erro: ${e.message}`);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(#0b0b0b,#000)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }}>
      <div style={{
        width: "100%", maxWidth: 900, background: "#1f2937",
        border: "1px solid #f97316", borderRadius: 16, padding: 20,
        boxShadow: "0 10px 30px rgba(0,0,0,.5)"
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h1 style={{color:"#fb923c",fontSize:22,fontWeight:800}}>💰 Modelos de Custo</h1>
          <button onClick={testarWebhook} style={{
            background:"#ea580c",border:0,padding:"8px 12px",borderRadius:10,color:"#fff",cursor:"pointer",fontWeight:700
          }}>
            ▶️ Testar webhook
          </button>
        </div>

        <pre style={{
          background:"#111827",padding:12,borderRadius:10,
          whiteSpace:"pre-wrap",maxHeight:260,overflow:"auto",border:"1px solid #374151"
        }}>{log}</pre>

        <div style={{marginTop:12,fontSize:12,color:"#9ca3af"}}>
          Dica: com HashRouter, use <code>#/modelos-custo</code> na URL (ex.: <code>http://localhost:5173/#/modelos-custo</code>).
        </div>
      </div>
    </div>
  );
}
