// src/Layout.jsx
import { Link, Outlet } from "react-router-dom"; // ou use Next.js com <Link>

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col">
      {/* Menu fixo */}
      <header className="bg-[#1B1E25] border-b border-[#ff9f43]/30 px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-[#ff9f43] text-lg">🍕 AdminDelivery</div>
        <nav className="flex gap-3 text-sm">
          <Link to="/dashboard" className="hover:text-[#ffb763]">🏠 Home</Link>
          <Link to="/cardapio" className="hover:text-[#ffb763]">📋 Cardápio</Link>
          <Link to="/relatorios" className="hover:text-[#ffb763]">📊 Relatórios</Link>
          <Link to="/configuracoes" className="hover:text-[#ffb763]">⚙️ Configurações</Link>
        </nav>
      </header>

      {/* Conteúdo da página atual */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
