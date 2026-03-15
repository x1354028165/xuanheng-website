'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RepairFormLabels {
  name: string;
  phone: string;
  email: string;
  product: string;
  description: string;
  submit: string;
  success: string;
}

interface RepairFormProps {
  labels: RepairFormLabels;
}

export function RepairForm({ labels }: RepairFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    product: '',
    description: '',
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
      const res = await fetch('/api/submit-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Submit failed');
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', product: '', description: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="repair-name" className="mb-1 block text-sm font-medium text-foreground">
          {labels.name} <span className="text-red-500">*</span>
        </label>
        <Input
          id="repair-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="repair-phone" className="mb-1 block text-sm font-medium text-foreground">
          {labels.phone} <span className="text-red-500">*</span>
        </label>
        <Input
          id="repair-phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="repair-email" className="mb-1 block text-sm font-medium text-foreground">
          {labels.email}
        </label>
        <Input
          id="repair-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="repair-product" className="mb-1 block text-sm font-medium text-foreground">
          {labels.product} <span className="text-red-500">*</span>
        </label>
        <select
          id="repair-product"
          name="product"
          value={formData.product}
          onChange={handleChange}
          required
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">--</option>
          <option value="controller">Controller</option>
          <option value="sensor">Sensor</option>
          <option value="actuator">Actuator</option>
          <option value="gateway">Gateway</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="repair-desc" className="mb-1 block text-sm font-medium text-foreground">
          {labels.description} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="repair-desc"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
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
        <p className="text-center text-sm text-red-600">Submit failed. Please try again.</p>
      )}
    </form>
  );
}
