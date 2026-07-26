import { ArrowUp, ArrowUpRight } from "lucide-react";

interface FooterProps {
  onBackToTop: () => void;
}

const Footer = ({ onBackToTop }: FooterProps) => (
  <footer id="footer" className="site-footer">
    <div className="footer-identity">
      <b className="tilted-card-text identity-card-text">Ramprakash Sah</b>
      <span>Full-Stack Systems Engineer</span>
    </div>
    <div className="footer-links">
      <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer">
        GitHub <ArrowUpRight />
      </a>
      <a
        href="https://np.linkedin.com/in/ramprakash-sah-b368a5179"
        target="_blank"
        rel="noreferrer"
      >
        LinkedIn <ArrowUpRight />
      </a>
    </div>
    <p>© {new Date().getFullYear()} Ramprakash Sah. Based in Kathmandu, Nepal.</p>
    <button className="glass-button footer-button" type="button" onClick={onBackToTop}>
      Back to top <ArrowUp />
    </button>
  </footer>
);

export default Footer;
