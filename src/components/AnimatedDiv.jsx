import { motion } from 'framer-motion';

const AnimatedText = ({ children }) => {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-slate-600 text-2xl p-4 ml-3 relative z-10"
      >
        {children}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
        animate={{ opacity: 1, boxShadow: '0px 20px 20px 20px rgba(76, 220, 239, 0.5)' }}
        transition={{ duration: 5 }}
        className="absolute top-0 left-0 w-full h-full mr-12 border-t-2 border-l-2 rounded-md border-[#4cdaf0]"
      ></motion.div>
    </div>
  );
};

export default AnimatedText;
