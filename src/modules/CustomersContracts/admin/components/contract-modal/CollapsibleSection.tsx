'use client';

import React, { useState } from 'react';

import {
  collapsibleHeaderStyle,
  collapsibleHeaderHoverStyle,
  sectionTitleStyle,
} from './contractModalStyles';

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection = React.memo(({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div>
      <div
        style={isHovered ? { ...collapsibleHeaderStyle, ...collapsibleHeaderHoverStyle } : collapsibleHeaderStyle}
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={sectionTitleStyle}>
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span style={{
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
          color: '#667eea',
          fontWeight: 'bold',
        }}>
          {'\u25BC'}
        </span>
      </div>
      {isOpen && (
        <div style={{
          padding: '16px',
          background: '#fafafa',
          borderRadius: '8px',
          marginBottom: '8px'
        }}>
          {children}
        </div>
      )}
    </div>
  );
});

export default CollapsibleSection;
