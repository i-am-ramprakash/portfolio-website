import { ContactFormData } from '../types';

// Using Formspree - a free service that handles form submissions and sends emails
// You'll need to replace 'YOUR_FORM_ID' with your actual Formspree form ID
// Sign up at https://formspree.io/ to get your form ID

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqalzwbz';

export const sendEmail = async (formData: ContactFormData): Promise<boolean> => {
  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        _subject: `New Portfolio Contact from ${formData.name}`,
        _replyto: formData.email,
        _format: 'plain'
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

// Alternative: Using EmailJS (requires more setup but more customizable)
// Uncomment and configure if you prefer EmailJS over Formspree

/*
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
const TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';
const PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';

export const sendEmailWithEmailJS = async (formData: ContactFormData): Promise<boolean> => {
  try {
    emailjs.init(PUBLIC_KEY);

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      to_name: 'Ramprakash Sah',
      reply_to: formData.email,
    };

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    return true;
  } catch (error) {
    console.error('Failed to send email via EmailJS:', error);
    return false;
  }
};
*/