import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-mesh">
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">Erro</p>
        <h1 className="mt-2 text-6xl font-semibold tracking-tight text-primary">404</h1>
        <p className="mt-4 text-sm text-dim-2">Página não encontrada</p>
        <a href="/admin" className="mt-6 inline-block text-sm text-primary hover:underline">
          ← Voltar ao painel
        </a>
      </div>
    </div>
  );
};

export default NotFound;
