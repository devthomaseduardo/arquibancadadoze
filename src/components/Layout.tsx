
import React, { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

// Use React.FC to properly handle children and avoid resolution issues in the parent component
const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-pitch relative">
      <div className="fixed inset-0 bg-grass-pattern opacity-[0.03] pointer-events-none z-0"></div>
      <Header />
      <main className="flex-1 z-10">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
