import { useEffect, useState } from "react";

export const useActiveSection = (sectionIds: string[]) => {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? "home");

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    let frameId = 0;

    const update = () => {
      frameId = 0;
      const focusLine = window.innerHeight * 0.46;
      const containingFocus = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= focusLine && rect.bottom > focusLine;
      });
      const nearest = containingFocus ?? sections.reduce<HTMLElement | null>((closest, section) => {
        if (!closest) return section;
        const sectionDistance = Math.abs(section.getBoundingClientRect().top - focusLine);
        const closestDistance = Math.abs(closest.getBoundingClientRect().top - focusLine);
        return sectionDistance < closestDistance ? section : closest;
      }, null);
      if (nearest) setActiveSection((current) => current === nearest.id ? current : nearest.id);
    };

    const scheduleUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [sectionIds]);

  return activeSection;
};
