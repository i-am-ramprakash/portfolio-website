import { useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, Github, Linkedin, Mail, Send } from 'lucide-react';
import { sendEmail } from '../../services/emailService';
import type { ContactFormData } from '../../types';

const presets = ['Full-stack role', 'Project collaboration', 'Résumé request'];
export default function Contact() {
  const [form, setForm] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(value => ({ ...value, [event.target.name]: event.target.value }));
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (new FormData(event.currentTarget).get('_gotcha')) return; setStatus('sending'); const ok = await sendEmail(form); setStatus(ok ? 'success' : 'error'); if (ok) setForm({ name: '', email: '', message: '' }); };
  return <section id="contact" className="contact-section section-pad" aria-labelledby="contact-title">
    <div className="section-kicker"><span>07</span> COMMUNICATION PORTAL — CONTACT</div>
    <div className="contact-grid"><div className="contact-copy"><span className="portal-signal"><i /> CHANNEL OPEN</span><h2 id="contact-title">Have a platform or<br /><em>engineering challenge?</em></h2><p>Open a communication channel for full-stack roles, product collaboration or a deeper look at my work.</p><div className="contact-direct"><a href="mailto:ramprakash777.sah@gmail.com"><Mail /> <span><small>EMAIL DIRECTLY</small>ramprakash777.sah@gmail.com</span><ArrowUpRight /></a><a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer"><Github /> GitHub</a><a href="https://www.linkedin.com/in/ramprakash-sah-b368a5179/" target="_blank" rel="noreferrer"><Linkedin /> LinkedIn</a><a href="mailto:ramprakash777.sah@gmail.com?subject=Resume%20request"><Mail /> Request résumé</a></div></div>
      <form className="contact-form" onSubmit={submit}><div className="form-head"><span>NEW TRANSMISSION</span><i>FORM CONNECTED VIA FORMSPREE</i></div><div className="honeypot" aria-hidden="true"><label>Leave empty<input name="_gotcha" tabIndex={-1} autoComplete="off" /></label></div><fieldset><legend>OPPORTUNITY TYPE</legend><div className="preset-chips">{presets.map(preset => <button type="button" key={preset} onClick={() => setForm(value => ({ ...value, message: value.message || `I'd like to discuss a ${preset.toLowerCase()}.` }))}>{preset}</button>)}</div></fieldset><label><span>NAME</span><input required name="name" autoComplete="name" value={form.name} onChange={change} placeholder="Your name" /></label><label><span>EMAIL</span><input required type="email" name="email" autoComplete="email" value={form.email} onChange={change} placeholder="you@company.com" /></label><label><span>MESSAGE <i>{form.message.length} chars</i></span><textarea required rows={6} name="message" value={form.message} onChange={change} placeholder="Tell me about the role, product or challenge…" /></label><button className="primary-btn" disabled={status === 'sending'}>{status === 'sending' ? 'Transmitting…' : <>Send transmission <Send /></>}</button><div className="form-feedback" aria-live="polite">{status === 'success' && <p className="success"><CheckCircle2 /> Message received. I’ll reply by email.</p>}{status === 'error' && <p className="error"><AlertCircle /> Form delivery failed. Please use the direct email link.</p>}</div></form>
    </div>
  </section>;
}
