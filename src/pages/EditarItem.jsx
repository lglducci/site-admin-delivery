 import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/** Pega id_empresa do localStorage de forma robusta */
function getIdEmpresa() {
  try {
    const direto = localStorage.getItem("id_empresa");
    if (direto && Number(direto)) return Number(direto);

    const raw = localStorage.getItem("empresa");
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj?.id_empresa) return Number(obj.id_empresa);
      if (obj?.idEmpresa)  return Number(obj.idEmpresa);
    }
  } catch (e) {
    console.error("Erro lendo empresa do localStorage:", e);
  }
  return null;
}

/** Normaliza retorno: aceita objeto único ou array e pega o primeiro válido */
function pickFirstItem(data) {
  if (!data) return null;
  const obj = Array.isArray(data) ? data[0] : data;
  if (!obj || typeof obj !== "object") return null;
  return obj;
}

export default function EditarItem() {
  // Aceita tanto /editar-item/:numero quanto /editar-item/:id
  const pa
