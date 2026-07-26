import { useCallback, useMemo, useState } from "react";
import { navigation } from "../data/navigation";
import { useActiveSection } from "../hooks/useActiveSection";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollNarrative } from "../hooks/useScrollNarrative";
import { useTheme } from "../hooks/useTheme";
import Footer from "./layout/Footer";
import CharacterStage from "./layout/CharacterStage";
import Header from "./layout/Header";
import AboutSection from "./sections/AboutSection";
import CapabilitiesSection from "./sections/CapabilitiesSection";
import CareerSection from "./sections/CareerSection";
import ContactSection from "./sections/ContactSection";
import HeroSection from "./sections/HeroSection";
import ToolkitSection from "./sections/ToolkitSection";
import WorkSection from "./sections/WorkSection";

const MainContainer = () => {
  const sectionIds = useMemo(() => ["home", ...navigation.map((item) => item.id), "footer"], []);
  const activeSection = useActiveSection(sectionIds);
  const reducedMotion = useReducedMotion();
  useScrollNarrative(reducedMotion);
  const { isDark, toggleTheme } = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  const toggleMenu = useCallback(() => setNavOpen((open) => !open), []);
  const navigateTo = useCallback(
    (id: string) => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
      });
      setNavOpen(false);
    },
    [reducedMotion],
  );

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header
        activeSection={activeSection}
        isDark={isDark}
        navOpen={navOpen}
        onNavigate={navigateTo}
        onToggleMenu={toggleMenu}
        onToggleTheme={toggleTheme}
      />
      <CharacterStage activeSection={activeSection} reducedMotion={reducedMotion} />
      <main id="main-content">
        <HeroSection reducedMotion={reducedMotion} onNavigate={navigateTo} />
        <AboutSection reducedMotion={reducedMotion} />
        <CapabilitiesSection reducedMotion={reducedMotion} />
        <CareerSection reducedMotion={reducedMotion} />
        <WorkSection reducedMotion={reducedMotion} />
        <ToolkitSection reducedMotion={reducedMotion} />
        <ContactSection reducedMotion={reducedMotion} />
      </main>
      <Footer onBackToTop={() => navigateTo("home")} />
    </div>
  );
};

export default MainContainer;
