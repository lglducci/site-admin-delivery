 import React, { useEffect, useMemo, useState } from "react";

/**
 * Mostra detalhes do pedido a partir do webhook que retorna:
 *
 * [
 *   {
 *     "pedido_detalhado": {
 *       "pedido_id": 46,
 *       "nome_cliente": "Benedito Rui Barbosa",
 *       "tipo_cobranca": "pix",
 *       "resumo": "📦 ... Entrega: R$3,00 ... Total: R$ 148.00 ...",
 *       "endereco": "rua beirute 14",
 *       "bairro": "centro",
 *       "itens": [{ "nome": "...", "quantidade": 1, "valor": 68, ... }]
 *     }
 *   }
 * ]
 */

function parseMoneyFromResumo(resumo, label) {
  if (!resumo) return null;
  // tenta "Entrega: R$3,00" ou "Total: R$ 148.00"
  const re = new RegExp(`${label}\\s*:\\s*R\\$\\s*([0-9]+[\\.,]?[0-9]{0,2})`, "i");
  const m = resumo.match(re);
  if (!m) return null;
 
  const raw = m[1].replace(",", ".");
 
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function formatBRL(n) {
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch {
    return `R$ ${Number(n).toFixed(2)}`;
  }
}

export default function ModalDetalhesPedido({ open, onClose, numero, idEmpresa }) {
  const [data, setData] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open || !numero) return;

    const carregar = async () => {
      try {
        // ⚠️ Ajuste para o endpoint que você confirmou (pedido_detalhado)
        const url = `https://webhook.lglducci.com.br/webhook/pedido_detalhado?numero=${numero}&id_empresa=${idEmpresa}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        // tenta JSON; se vier texto/HTML, ainda mostra como fallback
        let json;
        try {
          json = await resp.json();
        } catch {
          const text = await resp.text();
          // caso raro: veio HTML; mostra bruto
          setData({ html: text });
          setErro("");
          return;
        }

        /**
         * Normaliza o formato:
         * - pode vir como array com 1 objeto
         * - pode ter a chave "pedido_detalhado"
         */
        let payload = json;
        if (Array.isArray(json) && json.length > 0) payload = json[0];
        if (payload && payload.pedido_detalhado) payload = payload.pedido_detalhado;

        setData(payload || {});
        setErro("");
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar detalhes do pedido.");
      }
    };

    carregar();
  }, [open, numero, idEmpresa]);

  // Monta tabela de itens e totais
  const { itens = [], nome_cliente, tipo_cobranca, endereco, bairro, resumo } = data || {};

  const subtotal = useMemo(() => {
    if (!Array.isArray(itens)) return 0;
    return itens.reduce((acc, it) => acc + (Number(it.valor) || 0) * (Number(it.quantidade) || 1), 0);
  }, [itens]);

  const entregaFromResumo = useMemo(() => parseMoneyFromResumo(resumo, "Entrega"), [resumo]);
  const totalFromResumo = useMemo(() => parseMoneyFromResumo(resumo, "Total"), [resumo]);

  const entrega = entregaFromResumo ?? 0;
  const total = totalFromResumo ?? (subtotal + entrega);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1B1E25] text-white rounded-2xl shadow-2xl w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto p-6 relative border border-[#ff9f43]/40">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
          aria-label="Fechar"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-1 text-[#ff9f43]">
          Detalhes do Pedido nº {numero}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          {tipo_cobranca ? `Pagamento: ${String(tipo_cobranca).toUpperCase()}` : ""}
        </p>

        {erro && <p className="text-red-400 mb-4">{erro}</p>}

        {/* Se vier HTML bruto do webhook, renderiza direto */}
        {data?.html ? (
          <div
            className="prose prose-invert max-w-none text-gray-200"
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        ) : (
          <>
            {/* Linha com cliente e endereço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0F121A] rounded-xl p-3 border border-[#ff9f43]/20">
                <div className="text-xs text-gray-400">Cliente</div>
                <div className="text-sm font-semibold">
                  {nome_cliente || "—"}
                </div>
              </div>
              <div className="bg-[#0F121A] rounded-xl p-3 border border-[#ff9f43]/20">
                <div className="text-xs text-gray-400">Endereço</div>
                <div className="text-sm">
                  {endereco ? `${endereco}${bairro ? ` – ${bairro}` : ""}` : "—"}
                </div>
              </div>
            </div>

            {/* Itens */}
            <div className="rounded-xl overflow-hidden border border-[#ff9f43]/20 mb-4">
              <table className="w-full text-sm">
                <thead className="bg-[#0F121A]">
                  <tr className="text-left">
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2 text-center">Qtd</th>
                    <th className="px-3 py-2 text-right">Valor</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(itens) && itens.length > 0 ? (
                    itens.map((it, idx) => {
                      const qtd = Number(it.quantidade) || 1;
                      const val = Number(it.valor) || 0;
                      const sub = qtd * val;
                      return (
                        <tr key={idx} className="border-t border-[#ff9f43]/10">
                          <td className="px-3 py-2">
                            <div className="font-medium">{it.nome || "—"}</div>
                            <div className="text-xs text-gray-400">
                              {it.categoria || it.tipo || ""}
                              {it.fracionada ? " • fracionada" : ""}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">{qtd}</td>
                          <td className="px-3 py-2 text-right">{formatBRL(val)}</td>
                          <td className="px-3 py-2 text-right">{formatBRL(sub)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-gray-400">
                        Sem itens para este pedido.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totais */}
            <div className="flex flex-col gap-2 items-end">
              <div className="text-sm text-gray-300">
                Subtotal: <span className="font-semibold">{formatBRL(subtotal)}</span>
              </div>
              <div className="text-sm text-gray-300">
                Entrega: <span className="font-semibold">{formatBRL(entrega)}</span>
              </div>
              <div className="text-lg font-bold text-[#ff9f43]">
                Total: {formatBRL(total)}
              </div>
            </div>

            {/* Observações/resumo bruto (opcional) */}
            {data?.resumo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200">
                  Ver resumo bruto
                </summary>
                <pre className="mt-2 p-3 bg-[#0F121A] rounded-lg text-xs whitespace-pre-wrap text-gray-300">
{data.resumo}
                </pre>
              </details>
            )}
          </>
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
