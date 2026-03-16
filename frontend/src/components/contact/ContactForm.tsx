'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ContactFormLabels {
  name: string;
  company: string;
  phone: string;
  email: string;
  intent: string;
  intentOptions: {
    integrator: string;
    api: string;
    hardware: string;
    custom: string;
    other: string;
  };
  message: string;
  submit: string;
  success: string;
  error: string;
}

interface ContactFormProps {
  labels: ContactFormLabels;
}

export function ContactForm({ labels }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    intent: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, intentType: formData.intent }),
      });

      if (!res.ok) throw new Error('Submit failed');
      setStatus('success');
      setFormData({ name: '', company: '', phone: '', email: '', intent: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-foreground">
          {labels.name} <span className="text-red-500">*</span>
        </label>
        <Input
          id="contact-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="contact-company" className="mb-1 block text-sm font-medium text-foreground">
          {labels.company}
        </label>
        <Input
          id="contact-company"
          name="company"
          value={formData.company}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium text-foreground">
            {labels.phone} <span className="text-red-500">*</span>
          </label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-foreground">
            {labels.email} <span className="text-red-500">*</span>
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-intent" className="mb-1 block text-sm font-medium text-foreground">
          {labels.intent} <span className="text-red-500">*</span>
        </label>
        <select
          id="contact-intent"
          name="intent"
          value={formData.intent}
          onChange={handleChange}
          required
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">--</option>
          <option value="integrator">{labels.intentOptions.integrator}</option>
          <option value="api">{labels.intentOptions.api}</option>
          <option value="hardware">{labels.intentOptions.hardware}</option>
          <option value="custom">{labels.intentOptions.custom}</option>
          <option value="other">{labels.intentOptions.other}</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-foreground">
          {labels.message} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <Button type="submit" disabled={status === 'submitting'} className="w-full">
        {status === 'submitting' ? '...' : labels.submit}
      </Button>

      {status === 'success' && (
        <p className="text-center text-sm text-green-600">{labels.success}</p>
      )}
      {status === 'error' && (
        <p className="text-center text-sm text-red-600">{labels.error}</p>
      )}
    </form>
  );
}
