import { ContactFormData } from '../types';

// Existing production Formspree form endpoint.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqalzwbz';

export const sendEmail = async (formData: ContactFormData): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
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
  } finally {
    window.clearTimeout(timeout);
  }
};
