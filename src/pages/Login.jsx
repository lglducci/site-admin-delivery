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
      console.log("🔐 Resposta do login:", data);

      // 🔸 valida se veio o id_empresa
      if (data?.id_empresa) {
        const empresaData = {
          id_empresa: data.id_empresa,
          nome_empresa: data.nome_empresa,
          saudacao: data.saudacao,
        };

        salvarEmpresa(empresaData);
        localStorage.setItem("empresa", JSON.stringify(empresaData));

        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("email", data.email);

         
      // 🔸 NOVO: redirecionamento conforme tipo_admin
            if (data.tipo_admin === "cozinha") {
              navigate("/kds");
            } else {
              navigate("/dashboard");
            }
          } else {
            alert("Usuário inválido ou empresa não encontrada.");
          }


       
      } else {
        alert("Usuário inválido ou empresa não encontrada.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-white dark:bg-gray-700"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-white dark:bg-gray-700"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
