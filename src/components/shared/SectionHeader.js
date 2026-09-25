import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];

/** Stagger + card reveal variants shared by all section grids. */
export const useRevealVariants = (stagger = 0.08) => {
  const shouldReduceMotion = useReducedMotion();

  return {
    shouldReduceMotion,
    containerVariants: {
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduceMotion ? 0 : stagger },
      },
    },
    cardVariants: {
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: EASE },
      },
    },
    hover: shouldReduceMotion ? undefined : { y: -6 },
  };
};

const SectionHeader = ({ eyebrow, icon: Icon, title, children }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="ix-header"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <span className="ix-eyebrow">
        {Icon && (
          <span className="ix-eyebrow__icon" aria-hidden="true">
            <Icon />
          </span>
        )}
        {eyebrow}
      </span>

      <h2 className="ix-title">{title}</h2>

      {children && <p className="ix-lead">{children}</p>}
    </motion.div>
  );
};

export default SectionHeader;
