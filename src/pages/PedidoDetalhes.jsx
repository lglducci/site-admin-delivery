 import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function PedidoDetalhes() {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const numero = searchParams.get("numero");
  const id_empresa = searchParams.get("id_empresa");

  useEffect(() => {
    if (!numero || !id_empresa) return;

    const fetchPedido = async () => {
      try {
        console.log("🔎 Buscando pedido detalhado:", numero, id_empresa);

        const resp = await fetch(
          `/api/webhook/pedido_detalhado?numero=${numero}&id_empresa=${id_empresa}`
        );

        if (!resp.ok) throw new Error("Falha ao carregar pedido");

        const data = await resp.json();
        console.log("📦 Retorno bruto:", data);

        const pedidoData = data[0]?.pedido_detalhado || null;
        setPedido(pedidoData);
      } catch (e) {
        console.error("❌ Er
