import React, { useState } from 'react';
import emailjs from 'emailjs-com';

const subjects = [
  'General Inquiry',
  'Feedback',
  'Other',
];

const socialLinks = [
  { href: 'mailto:harshagarwal180806@gmail.com', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25V6.75A2.25 2.25 0 0018.75 4.5H5.25A2.25 2.25 0 003 6.75v10.5A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25v-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25l-5.25 3.75-5.25-3.75" /></svg>
  ), label: 'Email' },
  { href: 'https://github.com/ByteWarrior23', icon: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" /></svg>
  ), label: 'GitHub' },
  { href: 'https://linkedin.com/in/harsh-agrawal-6290b1273', icon: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" /></svg>
  ), label: 'LinkedIn' },
];

const ContactUsForm = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: subjects[0], message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    if (name === 'message') setCharCount(value.length);
  };

  const validatePhone = (phone) => {
    return /^\+?[0-9\-\s]{7,15}$/.test(phone);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || !form.phone) {
      setError('Please fill in all fields.');
      return;
    }
    if (!validatePhone(form.phone)) {
      setError('Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    emailjs.send(
      'service_2b9chvv', // Service ID
      'template_k0j58nr', // Template ID
      {
        from_name: form.name,
        from_email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      },
      'nWaTL8fAMk5i14ijX' // Public Key
    ).then(
      (result) => {
        setSubmitted(true);
        setLoading(false);
      },
      (error) => {
        setError('Failed to send email. Please try again later.');
        setLoading(false);
      }
    );
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/60 text-green-800 dark:text-green-200 rounded-xl p-6 mt-4 font-semibold flex flex-col items-center shadow-md animate-fadein">
        <svg className="w-12 h-12 mb-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        Thank you for contacting us!<br />We have received your message and will get back to you soon.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl max-w-xs sm:max-w-md mx-auto border border-zinc-200 dark:border-zinc-800 animate-fadein my-8" aria-label="Contact Us Form">
      <div className="flex flex-col items-center mb-4">
        <div className="bg-blue-100 dark:bg-blue-900/60 rounded-full p-2 mb-1">
          <svg className="w-7 h-7 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25V6.75A2.25 2.25 0 0018.75 4.5H5.25A2.25 2.25 0 003 6.75v10.5A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25v-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25l-5.25 3.75-5.25-3.75" /></svg>
        </div>
        <h3 className="text-xl font-bold text-dark dark:text-white mb-1">Contact Us</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm text-center">We'd love to hear from you! Fill out the form below and our team will respond promptly.</p>
      </div>
      <div className="mb-5 text-left">
        <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2" htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-900 dark:text-white transition-all"
          required
          aria-required="true"
        />
      </div>
      <div className="mb-5 text-left">
        <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2" htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-900 dark:text-white transition-all"
          required
          aria-required="true"
        />
      </div>
      <div className="mb-5 text-left">
        <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2" htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-900 dark:text-white transition-all"
          required
          aria-required="true"
          aria-describedby="phone-desc"
        />
        <span id="phone-desc" className="text-xs text-gray-400 dark:text-gray-500">Include country code if outside your country.</span>
      </div>
      <div className="mb-5 text-left">
        <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2" htmlFor="subject">Subject</label>
        <select
          id="subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-900 dark:text-white transition-all"
          required
          aria-required="true"
        >
          {subjects.map((subj) => (
            <option key={subj} value={subj}>{subj}</option>
          ))}
        </select>
      </div>
      <div className="mb-6 text-left">
        <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2" htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-900 dark:text-white transition-all"
          rows={5}
          maxLength={500}
          required
          aria-required="true"
          aria-describedby="message-counter"
        />
        <div id="message-counter" className="text-xs text-gray-400 dark:text-gray-500 text-right">{charCount}/500 characters</div>
      </div>
      {error && <div className="text-red-500 mb-4 font-semibold text-center" role="alert">{error}</div>}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center"
        aria-busy={loading}
        disabled={loading}
      >
        {loading && (
          <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        )}
        Send Message
      </button>
      <div className="flex justify-center gap-6 mt-8">
        {socialLinks.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-400 transition-colors duration-200">
            {link.icon}
          </a>
        ))}
      </div>
    </form>
  );
};

export default ContactUsForm; 