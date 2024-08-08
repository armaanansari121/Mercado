import React from "react";
import { motion } from "framer-motion";
import DirectionAwareContainer from "./DirectionAwareContainer";
import { Link } from "react-router-dom";

const Card = ({ imageUrl, title, paragraph }) => {
  const cardStyle = {
    width: "30vw",
    height: "78vh",
    maxWidth: "600px",
    maxHeight: "600px",
  };

  let textShadowColor;

  switch (title.toLowerCase()) {
    case "music":
      textShadowColor = "#39ff14";
      break;
    case "gaming":
      textShadowColor = "#00ffff";
      break;
    case "arts":
      textShadowColor = "#f522d9";
      break;
    default:
      textShadowColor = "rgba(255, 255, 255, 0.9)";
  }

  return (
    <motion.div
      style={{
        ...cardStyle,
        textShadow: `0 0 10px ${textShadowColor}`,
      }}
      className="bg-zinc-700 shadow-lg border rounded-xl p-2 m-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 5, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center items-center">
        <h2 className="text-white text-lg font-semibold mb-2">{title}</h2>
      </div>
      <div className="p-0 flex justify-center items-center m-0">
        <p className="text-slate-400 p-0">{paragraph}</p>
      </div>
      <div className="top-10">
        <Link to={`/MainMarket?theme=${title}`}>
          <DirectionAwareContainer imageUrl={imageUrl} title={title} />
        </Link>
      </div>
    </motion.div>
  );
};

export default Card;
