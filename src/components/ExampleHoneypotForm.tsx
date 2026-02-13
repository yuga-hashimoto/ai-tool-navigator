/**
 * Example: Using Honeypot in a React Form
 * 
 * This example shows how to add honeypot protection to any form.
 */

'use client';

import { useState } from 'react';
import { CombinedHoneypot, validateHoneypot, HONEYPOT_FIELDS } from '@/lib/security/honeypot';

export default function ExampleForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    // Honeypot validation is done server-side in the API route
    // But you can also validate client-side for early rejection
    
    const honeypotResult = validateHoneypot(formData);
    if (!honeypotResult.isValid) {
      // Silently succeed to fool the bot
      setSubmitted(true);
      return;
    }

    // Continue with normal submission
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-green-100 rounded">
        <p>Thank you for subscribing!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded border p-2"
        />
      </div>

      {/* Honeypot fields - hidden from humans, visible to bots */}
      <CombinedHoneypot 
        websiteFieldName={HONEYPOT_FIELDS.WEBSITE}
        companyFieldName={HONEYPOT_FIELDS.COMPANY}
        timeFieldName={HONEYPOT_FIELDS.TIMESTAMP}
        tokenFieldName={HONEYPOT_FIELDS.TOKEN}
      />

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Subscribe
      </button>
    </form>
  );
}
