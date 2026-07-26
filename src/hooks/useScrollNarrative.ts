import { useEffect } from "react";

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

export const useScrollNarrative = (reducedMotion: boolean) => {
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-narrative-effect]")];
    const scenes = sections.map((section) => ({
      section,
      effect: section.dataset.narrativeEffect ?? "rise",
      heading: section.querySelector<HTMLElement>(".section-heading"),
      words: [...section.querySelectorAll<HTMLElement>("[data-narrative-word]")],
      items: [...section.querySelectorAll<HTMLElement>(".reveal:not(.section-heading)")],
      carouselTrack: section.querySelector<HTMLElement>(".project-carousel-track"),
    }));

    if (reducedMotion) {
      scenes.forEach(({ section, heading, words, items, carouselTrack }) => {
        section.style.setProperty("--narrative-visibility", "1");
        section.style.setProperty("--narrative-clip", "0%");
        [heading, ...items].forEach((element) => {
          if (!element) return;
          element.style.removeProperty("opacity");
          element.style.removeProperty("transform");
        });
        words.forEach((word) => {
          word.style.removeProperty("--word-opacity");
          word.style.removeProperty("--word-x");
          word.style.removeProperty("--word-y");
        });
        if (carouselTrack) carouselTrack.style.animationPlayState = "paused";
      });
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;

      scenes.forEach(({ section, effect, heading, words, items, carouselTrack }, sectionIndex) => {
        const rect = section.getBoundingClientRect();
        const hasFocus = section.contains(document.activeElement);
        const enter = hasFocus
          ? 1
          : clamp((viewportHeight * 0.92 - rect.top) / (viewportHeight * 0.57));
        const exit = hasFocus
          ? 0
          : clamp((viewportHeight * 0.55 - rect.bottom) / (viewportHeight * 0.45));
        const visibility = clamp(enter - exit);
        section.style.setProperty("--narrative-visibility", visibility.toFixed(3));
        section.style.setProperty("--narrative-clip", `${((1 - visibility) * 48).toFixed(2)}%`);

        if (effect === "work") {
          if (carouselTrack) {
            carouselTrack.style.animationPlayState =
              enter >= 0.98 && exit < 0.05 ? "" : "paused";
          }
        }

        if (heading) {
          heading.style.opacity = visibility.toFixed(3);
          heading.style.transform = `translate3d(0, ${((1 - enter) * 22 - exit * 18).toFixed(2)}px, 0)`;
        }

        words.forEach((word, wordIndex) => {
          const wordEnter = clamp(enter * 1.45 - wordIndex * 0.085);
          const entryDirection = effect === "hero" && wordIndex % 2 ? 1 : -1;
          const exitDirection = (wordIndex + sectionIndex) % 2 ? 1 : -1;
          const x =
            (1 - wordEnter) * entryDirection * 46 +
            exit * exitDirection * (52 + wordIndex * 2);
          const y = (1 - wordEnter) * 12 - exit * 10;
          word.style.setProperty("--word-opacity", clamp(wordEnter - exit * 1.15).toFixed(3));
          word.style.setProperty("--word-x", `${x.toFixed(2)}px`);
          word.style.setProperty("--word-y", `${y.toFixed(2)}px`);
        });

        items.forEach((item, itemIndex) => {
          const itemEnter = clamp(enter * 1.35 - itemIndex * 0.075);
          let entryX = 0;
          let exitX = 0;
          let entryY = 26;

          if (effect === "career") {
            entryX = -30;
            exitX = 34;
            entryY = 0;
          } else if (effect === "contact") {
            entryX = itemIndex % 2 ? 30 : -30;
            exitX = -entryX;
            entryY = 0;
          } else if (effect === "toolkit") {
            entryY = itemIndex % 2 ? 30 : -24;
          } else if (effect === "capabilities") {
            entryX = itemIndex % 2 ? 18 : -18;
          }

          const x = (1 - itemEnter) * entryX + exit * exitX;
          const y = (1 - itemEnter) * entryY - exit * 20;
          item.style.opacity = clamp(itemEnter - exit).toFixed(3);
          item.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        });
      });
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("focusin", scheduleUpdate);
    window.addEventListener("focusout", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("focusin", scheduleUpdate);
      window.removeEventListener("focusout", scheduleUpdate);
    };
  }, [reducedMotion]);
};
