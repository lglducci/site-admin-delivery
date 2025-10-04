 import { createContext, useContext, useState, useEffect } from "react";

const EmpresaContext = createContext();

export function EmpresaProvider({ children }) {
  const [empresa, setEmpresa] = useState(null);
  const [carregado, setCarregado] = useState(false); // novo controle

  useEffect(() => {
    const saved = localStorage.getItem("empresa");
    if (saved) {
      setEmpresa(JSON.parse(saved));
    }
    setCarregado(true);
  }, []);

  const salvarEmpresa = (dados) => {
    setEmpresa(dados);
    localStorage.setItem("empresa", JSON.stringify(dados));
    if (dados?.id_empresa)
      localStorage.setItem("id_empresa", dados.id_empresa);
  };

  const limparEmpresa = () => {
    setEmpresa(null);
    localStorage.removeItem("empresa");
    localStorage.removeItem("id_empresa");
  };

  return (
    <EmpresaContext.Provider value={{ empresa, salvarEmpresa, limparEmpresa, carregado }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  return useContext(EmpresaContext);
}
