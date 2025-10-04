 import { createContext, useContext, useState, useEffect } from "react";

const EmpresaContext = createContext();

export function EmpresaProvider({ children }) {
  const [empresa, setEmpresa] = useState(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("empresa");
    if (saved) {
      try {
        setEmpresa(JSON.parse(saved));
      } catch {
        console.warn("Erro ao ler empresa do localStorage");
      }
    }
    setCarregado(true);
  }, []);

  const salvarEmpresa = (dados) => {
    setEmpresa(dados);
    localStorage.setItem("empresa", JSON.stringify(dados));
  };

  const limparEmpresa = () => {
    setEmpresa(null);
    localStorage.removeItem("empresa");
  };

  return (
    <EmpresaContext.Provider
      value={{ empresa, salvarEmpresa, limparEmpresa, carregado }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  return useContext(EmpresaContext);
}
