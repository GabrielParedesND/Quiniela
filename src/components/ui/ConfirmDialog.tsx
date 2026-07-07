'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  confirmStyle?: 'danger' | 'primary';
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText = 'Cancelar',
  confirmStyle = 'danger',
  loading = false,
  loadingText,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = 'confirm-dialog-title';

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    },
    [onCancel, loading]
  );

  // Focus trap + Escape listener
  useEffect(() => {
    if (!open) return;

    document.addEventListener('keydown', handleKeyDown);
    // Focus cancel button when dialog opens
    cancelButtonRef.current?.focus();

    // Prevent body scroll while dialog is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const confirmBgColor =
    confirmStyle === 'danger' ? 'var(--color-danger)' : 'var(--color-primary)';
  const confirmTextColor =
    confirmStyle === 'danger' ? '#ffffff' : 'var(--color-primaryText)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        // Close on overlay click (but not when loading)
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-xl p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2
          id={titleId}
          className="text-sm font-bold uppercase tracking-wider mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          {title}
        </h2>

        {/* Message */}
        <p className="text-xs mb-6" style={{ color: 'var(--color-muted)' }}>
          {message}
        </p>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-xs"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: 'var(--color-danger)',
            }}
          >
            {error}
          </div>
        )}

        {/* Buttons - stacked on mobile, side-by-side on larger */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-surface2)',
              color: 'var(--color-muted)',
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: confirmBgColor,
              color: confirmTextColor,
            }}
          >
            {loading ? (loadingText || confirmText) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { ConfirmDialogProps };
