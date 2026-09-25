import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Decorative background layer that drifts slightly slower than the page.
 * Purely visual (aria-hidden); disabled when the user prefers reduced motion.
 */
const Parallax = ({ children, className = "", distance = 60 }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <div ref={ref} className={`ix-parallax ${className}`} aria-hidden="true">
      <motion.div style={reduce ? undefined : { y }} className="ix-parallax__layer">
        {children}
      </motion.div>
    </div>
  );
};

export default Parallax;
