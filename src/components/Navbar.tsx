import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import "./styles/Navbar.css";

const Navbar = () => {
  useEffect(() => {
    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        let targetId = element.getAttribute("data-href");
        if (targetId) {
          e.preventDefault();
          const targetElem = document.querySelector(targetId);
          if (targetElem) {
            targetElem.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });
  }, []);

  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          RAMPRAKASH
        </a>
        <a
          href="https://github.com/i-am-ramprakash"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-connect"
          data-cursor="disable"
        >
          github.com/i-am-ramprakash
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
