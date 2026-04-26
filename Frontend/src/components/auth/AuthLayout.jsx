import React from 'react';
import { GraduationCap } from 'lucide-react';
import styles from './AuthLayout.module.css';

/**
 * AuthLayout — Compact split-screen auth wrapper.
 */
const AuthLayout = ({
  stepper,
  children,
  bottomLink
}) => {
  return (
    <div className={styles.layout}>

      {/* ── LEFT PANEL ───────────────────────────────────────── */}
      <div className={styles.left}>
        <div className={styles.leftInner}>

          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <GraduationCap size={22} color="#4f46e5" strokeWidth={2.5} />
            </div>
            <div className={styles.brandName}>
              College Smart Account
            </div>
          </div>

          {/* Stepper */}
          <div className={styles.stepperSlot}>
            {stepper}
          </div>

          {bottomLink && <div className={styles.bottomLink}>{bottomLink}</div>}

        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────── */}
      <div className={styles.right}>
        <div className={styles.rightInner}>
          {children}
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
