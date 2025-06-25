import React from 'react';
import styles from '../styles/SkeletonCard.module.css';

export const SkeletonCard: React.FC = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonAvatar} />
    <div className={styles.skeletonInfo}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonUsername} />
    </div>
  </div>
);

export default SkeletonCard;
