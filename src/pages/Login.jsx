 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmpresa } from "../context/EmpresaContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { salvarEmpresa } = useEmpresa();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://webhook.lglducci.com.br/webhook/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data?.id_empresa) {
        const empresaData = {
          id_empresa: data.id_empresa,
          nome_empresa: data.nome_empresa,
          saudacao: data.saudacao,
        };

        const tipo = (data?.tipo_admin ?? "admin").toString().toLowerCase().trim();

        salvarEmpresa(empresaData);
        localStorage.setItem("empresa", JSON.stringify(empresaData));
        localStorage.setItem("user_id", data.user_id ?? "");
        localStorage.setItem("email", data.email ?? "");
        localStorage.setItem("tipo_admin", tipo);

        if (tipo === "cozinha") navigate("/kds");
        else navigate("/dashboard");
      } else {
        alert("Usuário inválido ou empresa não encontrada.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #ff9f43 0%, #ff3c00 100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-80 border border-white/20"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow">
          🍕 AdminDelivery
        </h2>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 p-3 rounded bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold py-2 rounded-lg shadow-md hover:opacity-90 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
