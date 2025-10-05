 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PedidoCard from "../components/PedidoCard";
import { useEmpresa } from "../context/EmpresaContext";

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Contexto seguro (multiempresa preservado)
  let empresa = null;
  let limparEmpresaSafe = () => {};
  let carregado = false;

  try {
    const ctx = useEmpresa();
    if (ctx?.empresa) empresa = ctx.empresa;
    if (ctx?.limparEmpresa) limparEmpresaSafe = ctx.limparEmpresa;
    if (ctx?.carregado) carregado = ctx.carregado;
  } catch (e) {
    console.warn("Contexto ainda não carregado (seguro)");
  }

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        if (!carregado) return;

        const empresaId =
          (empresa && empresa.id_empresa) ||
          localStorage.getItem("id_empresa");

        if (!empresaId) {
          console.warn("Nenhum id_empresa disponível ainda");
          return;
        }

        console.log("🔎 Buscando pedidos da empresa:", empresaId);

        const response = await fetch(
          `https://webhook.lglducci.com.br/webhook/pedidos?id_empresa=${empresaId}`
        );
        const data = await response.json();

        const lista = Array.isArray(data) ? data : [];
        const pedidosAdaptados = lista.map((p) => ({
          numero: p.numero ?? p.pedido_id,
          status: p.status?.toLowerCase() ?? "recebido",
          nomeCliente: p.nomeCliente ?? p.nome ?? "Cliente",
          valor: Number(p.valor ?? 0),
          data: p.data ?? p.create_at ?? new Date().toISOString(),
        }));

        setPedidos(pedidosAdaptados);
      } c
