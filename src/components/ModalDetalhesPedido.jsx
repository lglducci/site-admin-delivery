 import React, { useEffect, useState } from "react";

export default function ModalDetalhesPedido({ open, onClose, numero, idEmpresa }) {
  const [detalhes, setDetalhes] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open || !numero) return;

    const carregar = async () => {
      try {
        const url = `https://webhook.lglducci.com.br/webhook/pedido_detalhado?numero=${numero}&id_empresa=${idEmpresa}`;
      
        const resp = await fetch(url);

        if (!resp.ok) throw new Error(`Erro HTTP ${resp.status}`);

        // tenta ler como JSON; se falhar, lê como texto
        let data;
        try {
          data = await resp.json();
        } catch {
          data = await resp.text();
        }

        // Se for objeto, converte para HTML bonitinho
        if (typeof data === "object") {
          let html = `<b>Pedido nº ${numero}</b><br>`;
          if (data.cliente) html += `<b>Cliente:</b> ${data.cliente}<br>`;
          if (data.endereco) html += `<b>Endereço:</b> ${data.endereco}<br>`;
          if (data.itens && Array.isArray(data.itens)) {
            html += `<b>Itens:</b><ul>`;
            for (const it of data.itens) {
              html += `<li>${it.nome} — R$ ${Number(it.valor).toFixed(2)}</li>`;
            }
            html += `</ul>`;
          }
          if (data.total) html += `<b>Total:</b> R$ ${Number(data.total).toFixed(2)}<br>`;
          if (data.pagamento) html += `<b>Pagamento:</b> ${data.pagamento}<br>`;
          setDetalhes(html);
        } else {
          // já é HTML
          setDetalhes(data || "<p>Nenhum detalhe encontrado.</p>");
        }

        setErro("");
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar detalhes do pedido.");
      }
    };

    carregar();
  }, [open, numero, idEmpresa]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1B1E25] text-white rounded-2xl shadow-2xl w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto p-6 relative border border-[#ff9f43]/40">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4 text-[#ff9f43]">
          Detalhes do Pedido nº {numero}
        </h2>

        {erro && <p className="text-red-400 mb-4">{erro}</p>}

        {!erro && !detalhes && (
          <p className="text-gray-400">Carregando detalhes do pedido...</p>
        )}

        {detalhes && (
          <div
            className="text-gray-200 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: detalhes }}
          />
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-[#ff9f43] text-[#1B1E25] font-semibold px-4 py-2 rounded-md hover:bg-[#ffb763] transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
