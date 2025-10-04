 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmpresa } from "../context/EmpresaContext";



// debug
console.log("Importou useEmpresa:", useEmpresa);

 
   

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  try {
    const { salvarEmpresa } = useEmpresa();
  } catch (e) {
    console.error("Erro ao chamar useEmpresa():", e);
  }
  // resto do componente...
}
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("https://webhook.lglducci.com.br/webhook/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data?.success) {
      salvarEmpresa({
        id_empresa: data.id_empresa,
        nome: data.nome_empresa,
        saudacao: data.saudacao,
      });

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      alert("Login inválido");
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
