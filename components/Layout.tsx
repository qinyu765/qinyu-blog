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
  const [headerVisible, setHeaderVisible] = useState(true);
  const isSearchActive =
    location.pathname === "/blog" &&
    new URLSearchParams(location.search).get("search") === "1";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHeaderVisible(y < lastY || y < 10);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <div className="min-h-screen relative font-body text-white selection:bg-p3cyan selection:text-black">
      <BackgroundEffect />

      {/* 固定顶栏 */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 py-2 px-8 flex items-center bg-p3black/90 backdrop-blur-[10px] border-b-2 border-p3blue transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* 左侧状态指示器 */}
        <div className="hidden md:flex flex-1 min-w-0 items-center space-x-2 text-sm font-mono text-p3cyan tracking-wider">
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

        {/* 桌面端居中导航 */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center justify-center space-x-4 flex-[2]"
        >
          {NAV_ITEMS.map((item) => (
            <SkewButton key={item.path} to={item.path}>
              {item.label}
            </SkewButton>
          ))}
        </nav>

        {/* 桌面端右侧搜索按钮 */}
        <div className="hidden md:flex flex-1 min-w-0 justify-end">
          <SkewButton to="/blog?search=1" hoverActive isActive={isSearchActive}>
            <span className="flex items-center gap-1.5"><Search size={14} />SEARCH</span>
          </SkewButton>
        </div>

        {/* 移动端汉堡按钮 */}
        <div className="md:hidden absolute right-6">
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

      <div className="fixed bottom-0 left-0 w-full h-[4px] bg-gradient-to-r from-p3red via-p3blue to-p3cyan z-40" />
    </div>
  );
};
