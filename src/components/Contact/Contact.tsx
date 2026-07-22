import { useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, Mail, Send, MessageSquare } from 'lucide-react';
import { sendEmail } from '../../services/emailService';
import type { ContactFormData } from '../../types';

const presets = [
  'Interested in hiring for a Full-Stack Software Engineer role.',
  'Want to discuss a project collaboration or freelance contract.',
  'Would like to request full technical resume & references.',
];

export default function Contact() {
  const [form, setForm] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handlePresetClick = (presetText: string) => {
    setForm(prev => ({
      ...prev,
      message: prev.message ? `${prev.message}\n${presetText}` : presetText,
    }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (new FormData(e.currentTarget).get('_gotcha')) return;
    setStatus('sending');
    const ok = await sendEmail(form);
    setStatus(ok ? 'success' : 'error');
    if (ok) setForm({ name: '', email: '', message: '' });
  };

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(v => ({ ...v, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="contact-section section-pad">
      <div className="contact-orb" aria-hidden="true" />
      <div className="section-kicker">
        <span>05</span> CONTACT / TRANSMISSION
      </div>

      <div className="contact-grid">
        <div className="contact-copy">
          <h2>
            Have an idea?<br />
            <em>Let’s give it depth.</em>
          </h2>
          <p>
            Tell me what you’re building, what’s getting in the way, or simply say hello. I usually respond within 24 hours.
          </p>

          <a href="mailto:ramprakash777.sah@gmail.com">
            <Mail /> ramprakash777.sah@gmail.com <ArrowUpRight />
          </a>

          <div className="availability">
            <span className="live-dot" />
            <div>
              <b>Open for select roles & projects</b>
              <small>Kathmandu, Nepal / Remote Worldwide</small>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={submit}>
          <div className="form-head">
            <span>MESSAGE CHANNEL</span>
            <i>SECURE ENCRYPTION</i>
          </div>

          <div className="honeypot" aria-hidden="true">
            <label>
              Leave this field empty
              <input name="_gotcha" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {/* Quick Preset Message Buttons */}
          <div className="preset-chips-group">
            <span className="preset-label">
              <MessageSquare style={{ width: 12, marginRight: 4, display: 'inline' }} /> Quick Topic Presets:
            </span>
            <div className="preset-chips">
              {presets.map(p => (
                <button
                  type="button"
                  key={p}
                  className="preset-chip"
                  onClick={() => handlePresetClick(p)}
                >
                  + {p.split(' ')[0]} {p.split(' ')[1]} {p.split(' ')[2]}
                </button>
              ))}
            </div>
          </div>

          <label>
            <span>YOUR NAME</span>
            <input
              required
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={change}
              placeholder="What should I call you?"
            />
          </label>

          <label>
            <span>EMAIL ADDRESS</span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={change}
              placeholder="you@company.com"
            />
          </label>

          <label>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>PROJECT / MESSAGE</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
                {form.message.length} chars
              </span>
            </div>
            <textarea
              required
              rows={5}
              name="message"
              value={form.message}
              onChange={change}
              placeholder="A little about your idea, timeline, or challenge..."
            />
          </label>

          <button className="primary-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Transmitting...' : <>Send Message <Send /></>}
          </button>

          <div aria-live="polite">
            {status === 'success' && (
              <p className="form-status success">
                <CheckCircle2 /> Message received! I’ll respond to your email shortly.
              </p>
            )}
            {status === 'error' && (
              <p className="form-status error">
                <AlertCircle /> Transmission failed. Please email ramprakash777.sah@gmail.com directly.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
