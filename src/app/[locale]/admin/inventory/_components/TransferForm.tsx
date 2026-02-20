'use client';

import { useState, useEffect } from 'react';
import { createTransfer, getWarehouses } from '@/actions/inventory';
import { Loader2 } from 'lucide-react';

interface TransferFormProps {
  initialProductId?: string; // Product ID
  initialProductSlug?: string; // Product Slug (for display)
  onSuccess?: () => void;
}

export function TransferForm({ initialProductId, initialProductSlug, onSuccess }: TransferFormProps) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    productId: initialProductId || '',
    sourceWarehouseId: '',
    targetWarehouseId: '',
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch warehouses for dropdowns
    getWarehouses().then(res => {
      if (res.success && res.data) {
        setWarehouses(res.data);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (formData.sourceWarehouseId === formData.targetWarehouseId) {
      setError('Source and target warehouses cannot be the same');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createTransfer({
        productId: formData.productId,
        sourceWarehouseId: formData.sourceWarehouseId,
        targetWarehouseId: formData.targetWarehouseId,
        quantity: formData.quantity,
      });

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Transfer failed');
      }
    } catch (e) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Product ID is hidden or readonly if provided */}
      {!initialProductId && (
        <div>
           <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
             Product ID
           </label>
           <input
             type="text"
             value={formData.productId}
             onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
             className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-zinc-100"
             required
           />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Source Warehouse
          </label>
          <select
            value={formData.sourceWarehouseId}
            onChange={(e) => setFormData(prev => ({ ...prev, sourceWarehouseId: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-zinc-100"
            required
          >
            <option value="">Select Source</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Target Warehouse
          </label>
          <select
            value={formData.targetWarehouseId}
            onChange={(e) => setFormData(prev => ({ ...prev, targetWarehouseId: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-zinc-100"
            required
          >
            <option value="">Select Target</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Quantity
        </label>
        <input
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
          className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-900 dark:text-zinc-100"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Create Transfer
      </button>
    </form>
  );
}
