 // src/pages/ModelosCusto.jsx
import React, { useEffect, useState } from "react";

export default function ModelosCusto() {
  const [log, setLog] = useState("🟢 Tela montou. Carregando...");
  const [modelos, setModelos] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // garante empresa local
        let empresa = null;
        try { empresa = JSON.parse(localStorage.getItem("empresa")); } catch {}
        if (!empresa?.id_empresa) {
          empresa = { id_empresa: 2 };
          localStorage.setItem("empresa", JSON.stringify(empresa));
        }

        const url = `/api/n8n/modelos_custo?id_empresa=${empresa.id_empresa}`;
        setLog((m) => m + `\n📡 GET ${url}`);

        const r = await fetch(url);
        const ct = r.headers.get("content-type") || "";
        const raw = await r.text();

        setLog((m) => m + `\n✅ Status ${r.status} • CT=${ct}`);

        // Se veio HTML, é SPA → proxy/host errado
        if (ct.includes("text/html") || raw.startsWith("<!DOCTYPE html")) {
          setErr("❌ O host respondeu HTML (SPA). Proxy/endpoint incorreto. Usei /api/n8n → n8n.webhook-test.");
          setLog((m) => m + `\n⚠️ Detectado HTML (primeiros 200):\n${raw.slice(0,200)}`);
          setModelos([]);
          return;
        }

        // Tenta parsear JSON
        let data = [];
        try { data = JSON.parse(raw); } catch (e) {
          setErr("❌ Resposta não é JSON válido.");
          setLog((m) => m + `\n⚠️ Parse JSON falhou. Trecho:\n${raw.slice(0,200)}`);
          return;
        }

        if (Array.isArray(data)) {
          setModelos(data);
          setLog((m) => m + `\n📦 itens=${data.length}`);
        } else {
          setErr("❌ JSON não é array.");
        }
      } catch (e) {
        setErr("❌ Erro ao carregar: " + e.message);
      }
    })();
  }, []);

  const salvar = async () => {
    try {
      let empresa = null;
      try { empresa = JSON.parse(localStorage.getItem("empresa")); } catch {}
      if (!empresa?.id_empresa) empresa = { id_empresa: 2 };

      const url = `/api/n8n/modelos_custo`; // usa o proxy novo
      setLog((m) => m + `\n📡 POST ${url}`);
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_empresa: empresa.id_empresa, modelos }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      alert("✅ Modelos salvos com sucesso!");
    } catch (e) {
      alert("❌ Falha ao salvar: " + e.message);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(#0b0b0b,#000)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:1000,background:"#1f2937",border:"1px solid #f97316",borderRadius:16,padding:20,boxShadow:"0 10px 30px rgba(0,0,0,.5)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h1 style={{color:"#fb923c",fontSize:22,fontWeight:800}}>💰 Modelos de Custo</h1>
          <button onClick={() => window.location.reload()} style={{background:"#374151",border:0,padding:"8px 12px",borderRadius:10,color:"#fff",cursor:"pointer"}}>🔄 Recarregar</button>
        </div>

        <pre style={{background:"#111827",padding:12,border:"1px solid #374151",borderRadius:10,whiteSpace:"pre-wrap",maxHeight:240,overflow:"auto"}}>{log}{err ? `\n${err}` : ""}</pre>

        <div style={{overflowX:"auto", marginTop:12}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{color:"#fb923c",borderBottom:"1px solid #f97316"}}>
                <th style={{padding:8,textAlign:"left"}}>Grupo</th>
                <th style={{padding:8,textAlign:"left"}}>Descrição</th>
                <th style={{padding:8,textAlign:"center"}}>Margem Mínima</th>
                <th style={{padding:8,textAlign:"center"}}>Margem Máxima</th>
              </tr>
            </thead>
            <tbody>
              {modelos.map((m,i)=>(
                <tr key={m.id_referencia ?? i} style={{borderBottom:"1px solid #374151"}}>
                  <td style={{padding:8,color:"#fdba74",fontWeight:600}}>{m.nome_grupo}</td>
                  <td style={{padding:8,color:"#d1d5db",fontSize:14}}>{m.descricao}</td>
                  <td style={{padding:8,textAlign:"center"}}>
                    <input type="number" value={m.margem_min} step="0.01"
                      style={{width:90,background:"#0f172a",color:"#fff",border:"1px solid #4b5563",borderRadius:8,padding:6,textAlign:"center"}}
                      onChange={(e)=>{
                        const val = Number(e.target.value);
                        setModelos(prev => prev.map((x,j)=> j===i ? {...x,margem_min:val} : x));
                      }}
                    />
                  </td>
                  <td style={{padding:8,textAlign:"center"}}>
                    <input type="number" value={m.margem_max} step="0.01"
                      style={{width:90,background:"#0f172a",color:"#fff",border:"1px solid #4b5563",borderRadius:8,padding:6,textAlign:"center"}}
                      onChange={(e)=>{
                        const val = Number(e.target.value);
                        setModelos(prev => prev.map((x,j)=> j===i ? {...x,margem_max:val} : x));
                      }}
                    />
                  </td>
                </tr>
              ))}
              {modelos.length === 0 && (
                <tr>
                  <td colSpan={4} style={{padding:16,textAlign:"center",color:"#9ca3af"}}>
                    ⚠️ Nenhum modelo carregado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",gap:12,marginTop:16}}>
          <button onClick={salvar} style={{background:"#ea580c",border:0,padding:"10px 16px",borderRadius:10,color:"#fff",cursor:"pointer",fontWeight:700}}>
            💾 Salvar e Sair
          </button>
        </div>
      </div>
    </div>
  );
}
