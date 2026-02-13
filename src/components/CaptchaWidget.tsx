'use client';

import { useState, useEffect } from 'react';

interface CaptchaWidgetProps {
  onSuccess: () => void;
  onExpired?: () => void;
}

interface CaptchaChallenge {
  id: string;
  type: string;
  question: string;
}

export default function CaptchaWidget({ onSuccess, onExpired }: CaptchaWidgetProps) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const generateCaptcha = async () => {
    setLoading(true);
    setError(null);
    setAnswer('');

    try {
      const response = await fetch('/api/captcha/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'simple' }),
      });

      const data = await response.json();
      
      if (data.id) {
        setChallenge(data);
        setAttempts(0);
      } else {
        setError('Failed to generate challenge');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const verifyCaptcha = async () => {
    if (!challenge || !answer) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: challenge.id, answer }),
      });

      const data = await response.json();

      if (data.valid) {
        onSuccess();
      } else {
        setAttempts(prev => prev + 1);
        setError('Incorrect. Please try again.');
        setAnswer('');
        
        if (attempts >= 2) {
          // Generate new challenge after too many failures
          await generateCaptcha();
        }
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCaptcha();
  };

  // Generate initial challenge
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Handle expiration
  useEffect(() => {
    if (challenge) {
      const timer = setTimeout(() => {
        setError('Challenge expired');
        onExpired?.();
        generateCaptcha();
      }, 300000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [challenge]);

  return (
    <div className="rounded border p-4 bg-gray-50">
      <form onSubmit={handleSubmit}>
        {loading ? (
          <div className="text-center py-2">Loading...</div>
        ) : challenge ? (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                {challenge.question}
              </label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                placeholder="Enter characters"
                className="w-full p-2 border rounded"
                maxLength={10}
                autoComplete="off"
              />
            </div>
            
            {error && (
              <p className="text-red-600 text-sm mb-2">{error}</p>
            )}
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!answer || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Verify
              </button>
              <button
                type="button"
                onClick={generateCaptcha}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Refresh
              </button>
            </div>
          </>
        ) : (
          <p className="text-red-600">Failed to load CAPTCHA</p>
        )}
      </form>
    </div>
  );
}
