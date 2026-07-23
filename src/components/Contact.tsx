import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h2>
          Get In <span>Touch</span>
        </h2>
        <div className="contact-box">
          <p>
            Have a project in mind, an opportunity to discuss, or just want to connect?
            Feel free to reach out directly via GitHub or check out my repositories.
          </p>
          <a
            href="https://github.com/i-am-ramprakash"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-email"
            data-cursor="disable"
          >
            github.com/i-am-ramprakash <MdArrowOutward style={{ display: "inline-block", verticalAlign: "middle" }} />
          </a>
          <h5 style={{ marginTop: "30px", color: "#94a3b8", fontSize: "14px", fontWeight: 400 }}>
            <MdCopyright style={{ verticalAlign: "middle" }} /> {new Date().getFullYear()} Ramprakash. All rights reserved.
          </h5>
        </div>
      </div>
    </div>
  );
};

export default Contact;
