import {
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";

const SocialIcons = () => {
  return (
    <div className="icons-section">
      <a
        href="https://github.com/i-am-ramprakash"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon"
        data-cursor="disable"
        aria-label="GitHub"
      >
        <FaGithub />
      </a>
      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon"
        data-cursor="disable"
        aria-label="LinkedIn"
      >
        <FaLinkedinIn />
      </a>
    </div>
  );
};

export default SocialIcons;
