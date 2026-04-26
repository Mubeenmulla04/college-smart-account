import React from 'react';
import { Check } from 'lucide-react';
import styles from './Stepper.module.css';

/**
 * Stepper — Compact vertical line step indicator.
 */
const Stepper = ({ steps = [], current = 1 }) => {
  return (
    <div className={styles.stepper}>
      {steps.map((step, idx) => {
        const isDone    = current > step.id;
        const isActive  = current === step.id;

        const circleClass = isDone
          ? styles.circleDone
          : isActive
          ? styles.circleActive
          : styles.circlePending;

        return (
          <div key={step.id} className={styles.row}>
            
            {/* Left: circle + connector */}
            <div className={styles.lineCol}>
              <div className={`${styles.circle} ${circleClass}`}>
                {isDone ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  step.icon && <step.icon size={16} strokeWidth={2} />
                )}
              </div>
              
              {/* Connector line (hide on last item) */}
              {idx < steps.length - 1 && (
                <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} />
              )}
            </div>

            {/* Right: text */}
            <div className={styles.textCol}>
              <div className={`${styles.label} ${isActive ? styles.labelActive : ''}`}>
                {step.label}
              </div>
              <div className={`${styles.desc} ${isActive ? styles.descActive : ''}`}>
                {step.desc}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
