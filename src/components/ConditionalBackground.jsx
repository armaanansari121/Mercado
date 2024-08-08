import React from "react";
import { motion } from "framer-motion";

export const ConditionalBackground = ({
  children,
  className,
  containerClassName,
  animate = true,
  type // Added prop to determine the type (music, gaming, arts)
}) => {
  const getColor = () => {
    switch (type) {
      case "music":
        return "#39ff14"; // Neon green
      case "gaming":
        return "#00ffff"; // Neon blue
      case "arts":
        return "#F535AA"; // Neon purple
      default:
        return "#ffffff"; // Default to white if no type is specified
    }
  };

  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  return (
    <div
      className={`relative p-[4px] group ${containerClassName}`}
      style={{ opacity: 0.6 }}
    >
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
          backgroundColor: getColor(), // Set background color based on type
        }}
        className={`absolute inset-0 rounded-3xl z-[1] group-hover:opacity-100 blur-2xl transition duration-500 will-change-transform`} // Increased shadow effect to blur-2xl
      />
      <div className={`relative  z-10 ${className}`}>{children}</div>
    </div>
  );
};
