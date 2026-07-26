import { ArrowUpRight, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
import { sendEmail } from "../../services/emailService";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

interface ContactSectionProps {
  reducedMotion: boolean;
}

const ContactSection = ({ reducedMotion }: ContactSectionProps) => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [company, setCompany] = useState("");
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (formState === "success" || formState === "error") setFormState("idle");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (company) {
      setFormState("success");
      return;
    }
    setFormState("sending");
    const sent = await sendEmail(formData);
    setFormState(sent ? "success" : "error");
    if (sent) setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section
      id="contact"
      className="content-section contact-section narrative-section"
      data-narrative-effect="contact"
      data-character-side="left"
      aria-labelledby="contact-title"
    >
      <SectionHeading
        id="contact-title"
        number="06"
        eyebrow="Contact"
        title="Have a role, project,"
        accent="or problem?"
        description="Share the context and I’ll respond through the email address you provide."
        reducedMotion={reducedMotion}
      />
      <div className="mobile-character-slot" data-mobile-character-anchor aria-hidden="true" />
      <div className="contact-grid" data-character-anchor>
        <Reveal className="contact-intro" delay={80} reducedMotion={reducedMotion}>
          <h3>Let&apos;s make something work.</h3>
          <p>
            I&apos;m open to conversations about full-stack engineering, product development,
            backend systems, and interactive applications.
          </p>
          <div className="contact-links">
            <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer">
              <span><small>Code and projects</small>GitHub</span><ArrowUpRight />
            </a>
            <a
              href="https://np.linkedin.com/in/ramprakash-sah-b368a5179"
              target="_blank"
              rel="noreferrer"
            >
              <span><small>Professional profile</small>LinkedIn</span><ArrowUpRight />
            </a>
          </div>
        </Reveal>

        <Reveal className="contact-form-wrap" delay={150} reducedMotion={reducedMotion}>
          <form className="contact-form" onSubmit={handleSubmit} aria-busy={formState === "sending"}>
            <div className="form-heading">
              <span>Send a message</span>
              <small>All fields are required.</small>
            </div>
            <input
              className="honeypot"
              type="text"
              name="b_hp_check"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              tabIndex={-1}
              autoComplete="new-password"
              aria-hidden="true"
            />
            <div className="field-row">
              <label>
                <span>Your name</span>
                <input
                  required
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="How should I address you?"
                />
              </label>
              <label>
                <span>Email address</span>
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <label>
              <span className="message-label">
                Message <small>{formData.message.length}/1000</small>
              </span>
              <textarea
                required
                name="message"
                minLength={20}
                maxLength={1000}
                rows={6}
                value={formData.message}
                onChange={(event) => updateField("message", event.target.value)}
                placeholder="Tell me about the opportunity or problem..."
              />
            </label>
            <button className="button button-primary glass-button" type="submit" disabled={formState === "sending"}>
              {formState === "sending" ? "Sending…" : "Send message"} <Send />
            </button>
            <div className="form-feedback" aria-live="polite">
              {formState === "success" && <p className="success">Message sent. Thank you.</p>}
              {formState === "error" && (
                <p className="error">
                  The message could not be sent. Please try again or contact me through LinkedIn.
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSection;
