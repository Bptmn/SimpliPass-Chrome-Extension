import React from 'react';
import './skeletonCard.css';

export const SkeletonCard: React.FC = () => (
  <div className="skeleton-card">
    <div className="skeleton-avatar" />
    <div className="skeleton-info">
      <div className="skeleton-title" />
      <div className="skeleton-username" />
    </div>
  </div>
);

export default SkeletonCard; 