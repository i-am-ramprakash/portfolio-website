import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.innerWidth < 900) return;

  const paras = document.querySelectorAll(".para");
  const titles = document.querySelectorAll(".title");

  const TriggerStart = window.innerWidth <= 1024 ? "top 60%" : "20% 60%";
  const ToggleAction = "play pause resume reverse";

  paras.forEach((para) => {
    para.classList.add("visible");
    gsap.fromTo(
      para,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: para.parentElement || para,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
      }
    );
  });

  titles.forEach((title) => {
    gsap.fromTo(
      title,
      { autoAlpha: 0, y: 50, rotate: 3 },
      {
        autoAlpha: 1,
        y: 0,
        rotate: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: title.parentElement || title,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
      }
    );
  });
}
