import React, { useState, useEffect } from "react";
import { NAV_ITEMS } from "../constants";
import { SkewButton } from "./ui/SkewButton";
import { BackgroundEffect } from "./ui/BackgroundEffect";
import { HamburgerMenu, HamburgerButton } from "./ui/HamburgerMenu";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Search } from "lucide-react";

export const Layout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSearchActive =
    location.pathname === "/blog" &&
    new URLSearchParams(location.search).get("search") === "1";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen relative font-body text-white selection:bg-p3cyan selection:text-black overflow-x-hidden">
      <BackgroundEffect />

      {/* 固定顶栏 */}
      <header
        className="fixed top-0 left-0 right-0 z-50 py-2 pb-8 px-4 md:px-8 flex items-center bg-p3black/40 backdrop-blur-xl backdrop-saturate-150"
        style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)' }}
      >
        {/* 顶部导航栏底边缘细线 */}
        {/* <div className="absolute left-0 right-0 bottom-8 h-[1px] bg-white/15 pointer-events-none" /> */}
        {/* 左侧 Logo + 状态指示器 */}
        <div className="hidden md:flex flex-1 min-w-0 items-center space-x-2 text-sm font-mono text-p3cyan tracking-wider">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Logo" className="h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </Link>
          <span className="text-p3blue"> ❯❯  </span>
          <Link to="/" className="hover:text-white transition-colors">
            SYSTEM
          </Link>
          <span>//</span>
          {location.pathname === "/" ? (
            <span>ROOT</span>
          ) : (
            location.pathname
              .substring(1)
              .split("/")
              .map((segment, i, arr) => {
                const path = "/" + arr.slice(0, i + 1).join("/");
                return (
                  <React.Fragment key={path}>
                    {i > 0 && <span>/</span>}
                    <Link
                      to={path}
                      className="hover:text-white transition-colors"
                    >
                      {decodeURIComponent(segment).toUpperCase()}
                    </Link>
                  </React.Fragment>
                );
              })
          )}
        </div>

        {/* 桌面端右侧导航 */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center justify-end gap-2"
        >
          {NAV_ITEMS.map((item) => (
            <SkewButton key={item.path} to={item.path}>
              {item.label}
            </SkewButton>
          ))}
          <div className="ml-10">
            <SkewButton to="/blog?search=1" hoverActive isActive={isSearchActive}>
              <span className="flex items-center gap-1.5"><Search size={14} />Search</span>
            </SkewButton>
          </div>
        </nav>

        {/* 移动端 Logo */}
        <div className="md:hidden flex items-center">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Logo" className="h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </Link>
        </div>

        {/* 移动端汉堡按钮 */}
        <div className="md:hidden absolute right-4">
          <HamburgerButton
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>
      </header>

      {/* 移动端侧滑菜单 */}
      <HamburgerMenu
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(false)}
        navItems={NAV_ITEMS}
      />

      <main className="md:pt-20 pt-16 pb-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto min-h-screen flex flex-col relative z-10">
        <Outlet />
      </main>

    </div>
  );
};
