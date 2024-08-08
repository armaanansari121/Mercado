import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="border-8 border-white border-opacity-30 rounded-full w-16 h-16 animate-spin"></div>
      <p className="mt-4 text-white font-bold text-lg">Loading...</p>
    </div>
  );
};

export default Loader;
