import { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  useEffect(() => {
    const handleTouchClick = (container: HTMLDivElement) => {
      container.classList.toggle("what-content-active");
    };

    containerRef.current.forEach((container) => {
      if (container) {
        container.addEventListener("click", () => handleTouchClick(container));
      }
    });

    return () => {
      containerRef.current.forEach((container) => {
        if (container) {
          container.removeEventListener("click", () => handleTouchClick(container));
        }
      });
    };
  }, []);

  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 0)}
          >
            <div className="what-content-in">
              <h3>BACKEND ENGINEERING</h3>
              <h4>Spring Boot, Microservices & Database Workflows</h4>
              <p>
                Building secure REST APIs, enterprise Spring Boot applications, JPA/Hibernate persistence, and optimized database workflows.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">Java</div>
                <div className="what-tags">Spring Boot</div>
                <div className="what-tags">Hibernate / JPA</div>
                <div className="what-tags">REST APIs</div>
                <div className="what-tags">SQL / PostgreSQL</div>
                <div className="what-tags">Supabase</div>
                <div className="what-tags">RBAC</div>
              </div>
            </div>
          </div>
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 1)}
          >
            <div className="what-content-in">
              <h3>FRONTEND & INTERACTIVE</h3>
              <h4>React, TypeScript & Web Mobile Apps</h4>
              <p>
                Engineering modern React interfaces, Jetpack Compose Android shells, WebRTC communication, and HTML5 Canvas game engines.
              </p>
              <h5>Skillset & tools</h5>
              <div className="what-content-flex">
                <div className="what-tags">React</div>
                <div className="what-tags">TypeScript</div>
                <div className="what-tags">Angular</div>
                <div className="what-tags">Kotlin</div>
                <div className="what-tags">Jetpack Compose</div>
                <div className="what-tags">WebRTC</div>
                <div className="what-tags">Tailwind CSS</div>
                <div className="what-tags">Three.js</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;
