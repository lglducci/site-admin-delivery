import { createContext, useContext, useState, useEffect } from "react";

const EmpresaContext = createContext();

export function EmpresaProvider({ children }) {
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    // Carregar do localStorage ao abrir o app
    const saved = localStorage.getItem("empresa");
    if (saved) {
      setEmpresa(JSON.parse(saved));
    }
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
    <EmpresaContext.Provider value={{ empresa, salvarEmpresa, limparEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  return useContext(EmpresaContext);
}
