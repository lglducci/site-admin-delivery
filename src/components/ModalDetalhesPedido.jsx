 import React, { useEffect, useState } from "react";

export default function ModalDetalhesPedido({ open, onClose, numero, idEmpresa }) {
  const [detalhes, setDetalhes] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open || !numero) return;

    const carregar = async () => {
      try {
        const url = `https://webhook.lglducci.com.br/webhook/pedido_detalhes?numero=${numero}&id_empresa=${idEmpresa}`;
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
