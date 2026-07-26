import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { navigation } from "../../data/navigation";

interface HeaderProps {
  activeSection: string;
  isDark: boolean;
  navOpen: boolean;
  onNavigate: (id: string) => void;
  onToggleMenu: () => void;
  onToggleTheme: () => void;
}

const Header = ({
  activeSection,
  isDark,
  navOpen,
  onNavigate,
  onToggleMenu,
  onToggleTheme,
}: HeaderProps) => {
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.classList.toggle("menu-open", navOpen);
    if (!navOpen) return;

    const focusable = navRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
    focusable?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onToggleMenu();
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navOpen, onToggleMenu]);

  return (
    <header className="site-header">
      <button className="wordmark" type="button" onClick={() => onNavigate("home")}>
        <span>RP</span>
        <b className="tilted-card-text identity-card-text">Ramprakash Sah</b>
      </button>

      <nav
        ref={navRef}
        id="primary-navigation"
        className={navOpen ? "primary-navigation is-open" : "primary-navigation"}
        aria-label="Primary navigation"
      >
        {navigation.map((item) => (
          <button
            type="button"
            key={item.id}
            className={activeSection === item.id ? "is-active" : ""}
            aria-current={activeSection === item.id ? "page" : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <span className={activeSection === item.id ? "tilted-card-text nav-card-text" : ""}>
              {item.label}
            </span>
          </button>
        ))}
        <a
          className="mobile-nav-contact"
          href="https://github.com/i-am-ramprakash"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <ArrowUpRight />
        </a>
      </nav>

      <div className="header-actions">
        <button
          className="theme-toggle glass-button"
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={isDark}
        >
          {isDark ? <Sun /> : <Moon />}
        </button>
        <button className="header-cta glass-button" type="button" onClick={() => onNavigate("contact")}>
          Let&apos;s talk <ArrowUpRight />
        </button>
        <button
          ref={menuButtonRef}
          className="menu-toggle glass-button"
          type="button"
          onClick={onToggleMenu}
          aria-expanded={navOpen}
          aria-controls="primary-navigation"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
        >
          {navOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
};

export default Header;
