import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '../../types';

interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  navItems: NavItem[];
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onToggle,
  navItems,
}) => {
  const location = useLocation();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // 短暂延迟后添加过渡动画类，防止初次渲染闪缩
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 半透明遮罩层（点击关闭菜单） */}
      <div
        className={`
          fixed inset-0 bg-p3dark/60 backdrop-blur-sm
          z-[54]
          ${isMounted ? 'transition-opacity duration-300' : ''}
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onToggle}
        aria-hidden="true"
      />

      {/* 右侧滑入菜单面板 */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-64 max-w-[65vw]
          bg-p3dark/95 backdrop-blur-md
          border-l-2 border-p3cyan
          transform
          z-[55]
          ${isMounted ? 'transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]' : ''}
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
      >
        {/* 顶部装饰斜切条 */}
        <div className="absolute top-0 left-0 right-0 h-16 transform -skew-x-12 bg-p3blue/20 border-b-2 border-p3cyan/50" />

        {/* 导航项列表 */}
        <div className="pt-20 px-6 space-y-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  onToggle();
                  const [pathPart, hashPart] = item.path.split('#');
                  const path = pathPart || '/';
                  if (location.pathname === path && location.hash === (hashPart ? `#${hashPart}` : '')) {
                    if (hashPart) {
                      document.getElementById(hashPart)?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
                className={`
                  relative group block w-full
                  transform -skew-x-12 transition-all duration-300
                  border-2
                  ${isActive ? 'bg-white border-p3blue' : 'bg-transparent border-white hover:bg-p3blue/50'}
                `}
              >
                {/* 文字层（反向斜切保持水平） */}
                <div className="relative px-8 py-3 transform skew-x-12">
                  <span
                    className={`
                      font-display text-lg tracking-wider block
                      transition-colors duration-300
                      ${isActive ? 'text-p3dark font-bold' : 'text-white group-hover:text-p3cyan'}
                    `}
                  >
                    {item.label}
                  </span>
                </div>

                {/* 激活态指示菱形 */}
                {isActive && (
                  <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-2 h-2 bg-p3cyan rotate-45 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        {/* 底部装饰渐变线 */}
        <div className="absolute bottom-8 left-6 right-6">
          <div className="h-1 bg-gradient-to-r from-p3blue via-p3cyan to-p3blue opacity-50" />
        </div>
      </div>
    </>
  );
};

interface HamburgerButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="relative z-[60] w-12 h-12 flex items-center justify-center pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p3cyan focus-visible:ring-offset-2 focus-visible:ring-offset-p3dark"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      {/* 斜切背景 */}
      <div className="absolute inset-0 transform -skew-x-12 bg-p3white border-2 border-p3blue shadow-[3px_3px_0px_rgba(18,105,204,0.5)]" />

      {/* 三横线图标（开/关态通过 transform 变形为 X） */}
      <div className="relative z-10 transform skew-x-12 p-3">
        <span
          className={`
            block w-6 h-0.5 bg-p3dark
            transition-[transform] duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            origin-center
            ${isOpen ? 'rotate-45 translate-y-2' : 'rotate-0 translate-y-0'}
          `}
        />
        <span
          className={`
            block w-6 h-0.5 bg-p3dark mt-1.5
            transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            origin-center
            ${isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}
          `}
        />
        <span
          className={`
            block w-6 h-0.5 bg-p3dark mt-1.5
            transition-[transform] duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
            origin-center
            ${isOpen ? '-rotate-45 -translate-y-2' : 'rotate-0 translate-y-0'}
          `}
        />
      </div>
    </button>
  );
};
