import { ArrowUp } from "lucide-react";
import FooterPolarBearCanvas from "../Character/FooterPolarBearCanvas";

interface FooterProps {
  onBackToTop: () => void;
}

interface FooterOrbitLinesProps {
  layer: "back" | "contrast" | "front";
}

const FooterOrbitLines = ({ layer }: FooterOrbitLinesProps) => (
  <svg
    className={`footer-orbit-lines footer-orbit-lines-${layer}`}
    viewBox="0 0 200 200"
    role="presentation"
  >
    {Array.from({ length: 24 }, (_, index) => (
      <rect
        key={index}
        x="38"
        y="38"
        width="124"
        height="124"
        rx="18"
        transform={`rotate(${index * 7.5} 100 100)`}
      />
    ))}
  </svg>
);

const Footer = ({ onBackToTop }: FooterProps) => (
  <footer id="footer" className="site-footer">
    <div className="footer-details">
      <h4 className="tilted-card-text identity-card-text">Ramprakash Sah</h4>
      <p className="footer-role">Full-Stack Systems Engineer</p>
      <p className="footer-copyright">
        © {new Date().getFullYear()} Ramprakash Sah. Based in Kathmandu, Nepal.
      </p>
    </div>

    <div className="footer-character-orbit" data-character-anchor aria-hidden="true">
      <FooterOrbitLines layer="back" />
      <FooterPolarBearCanvas />
      <FooterOrbitLines layer="contrast" />
      <FooterOrbitLines layer="front" />
    </div>

    <div
      className="mobile-character-slot mobile-character-slot-footer"
      data-mobile-character-anchor
      aria-hidden="true"
    />

    <div className="footer-actions">
      <div className="footer-links" aria-label="Social profiles">
        <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.02c-3.23.7-3.91-1.37-3.91-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.4-1.27.74-1.56-2.58-.3-5.29-1.29-5.29-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.4-2.72 5.38-5.3 5.67.42.36.79 1.07.79 2.16v3.01c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
          </svg>
          <span>GitHub</span>
        </a>
        <a
          href="https://np.linkedin.com/in/ramprakash-sah-b368a5179"
          target="_blank"
          rel="noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M5.3 7.7H1.7V22h3.6V7.7ZM3.5 1A2.1 2.1 0 1 0 3.5 5.2 2.1 2.1 0 0 0 3.5 1ZM22.3 13.8c0-4.3-2.3-6.3-5.4-6.3a4.7 4.7 0 0 0-4.2 2.3V7.7H9.1V22h3.6v-7.1c0-1.9.36-3.7 2.7-3.7 2.3 0 2.3 2.1 2.3 3.8v7h3.6l1-8.2Z" />
          </svg>
          <span>LinkedIn</span>
        </a>
      </div>
      <button className="glass-button footer-button" type="button" onClick={onBackToTop}>
        Back to top <ArrowUp />
      </button>
    </div>
  </footer>
);

export default Footer;
