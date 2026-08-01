import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "../app/page";
import "../app/globals.css";

const StudioPage = lazy(() => import("../app/studio/page"));

function StaticRouter() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/studio") {
    return (
      <Suspense fallback={<div aria-label="正在载入编辑后台" />}>
        <StudioPage />
      </Suspense>
    );
  }

  return <HomePage />;
}

createRoot(document.getElementById("root")!).render(<StaticRouter />);
