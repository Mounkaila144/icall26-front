import type React from 'react';

// Shared overlay & modal container
export const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
};

export const modalStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '32px',
  maxWidth: '900px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
};

// Header
export const headerStyle: React.CSSProperties = {
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '2px solid #f0f0f0',
};

export const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: 0,
};

export const subtitleStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#888',
  marginTop: '8px',
};

// Form fields
export const formGroupStyle: React.CSSProperties = {
  marginBottom: '16px',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: '#555',
  marginBottom: '6px',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: '80px',
  resize: 'vertical',
  fontFamily: 'inherit',
};

export const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

export const row3Style: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '16px',
};

// Error
export const errorStyle: React.CSSProperties = {
  background: '#fee',
  color: '#c33',
  padding: '12px',
  borderRadius: '6px',
  marginBottom: '16px',
  fontSize: '14px',
  border: '1px solid #fcc',
};

// Buttons
export const buttonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '24px',
  paddingTop: '20px',
  borderTop: '2px solid #f0f0f0',
};

export const buttonStyle: React.CSSProperties = {
  padding: '10px 24px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: 'none',
};

export const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
};

export const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#e0e0e0',
  color: '#555',
};

// CollapsibleSection (Create modal)
export const collapsibleHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
  border: '1px solid #667eea40',
  borderRadius: '8px',
  cursor: 'pointer',
  marginTop: '16px',
  marginBottom: '12px',
  transition: 'all 0.2s',
};

export const collapsibleHeaderHoverStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea25 0%, #764ba225 100%)',
};

export const sectionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#667eea',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

// Tabs (Edit modal)
export const tabsContainerStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '2px solid #f0f0f0',
  marginBottom: '24px',
  gap: '8px',
  flexWrap: 'wrap',
};

export const getTabStyle = (isActive: boolean): React.CSSProperties => ({
  padding: '12px 20px',
  cursor: 'pointer',
  border: 'none',
  background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
  color: isActive ? 'white' : '#667eea',
  fontWeight: '600',
  fontSize: '14px',
  borderRadius: '8px 8px 0 0',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  position: 'relative',
  bottom: isActive ? '-2px' : '0',
});

export const tabContentStyle: React.CSSProperties = {
  padding: '20px',
  background: '#fafafa',
  borderRadius: '8px',
  minHeight: '400px',
};
