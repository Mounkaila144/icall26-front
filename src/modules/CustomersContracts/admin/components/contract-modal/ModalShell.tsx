'use client';

import React from 'react';

import {
  overlayStyle,
  modalStyle,
  headerStyle,
  titleStyle,
  subtitleStyle,
  errorStyle,
  buttonsStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from './contractModalStyles';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  error: string | null;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  cancelLabel: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  afterForm?: React.ReactNode;
}

export default function ModalShell({
  title,
  subtitle,
  error,
  loading,
  submitLabel,
  loadingLabel,
  cancelLabel,
  onClose,
  onSubmit,
  children,
  afterForm,
}: ModalShellProps) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={onSubmit}>
          {children}

          <div style={buttonsStyle}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#d0d0d0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e0e0e0';
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? loadingLabel : submitLabel}
            </button>
          </div>
        </form>

        {afterForm}
      </div>
    </div>
  );
}
