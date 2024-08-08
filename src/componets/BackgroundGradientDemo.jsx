import React from "react";
import { BackgroundGradient } from "./BackgroundGradient";

export function BackgroundGradientDemo({ children }) {
  return (
    <div className="flex justify-center items-center h-full">
      <BackgroundGradient className="rounded-[22px] sm:p-2 bg-[#b4b2b231] dark:bg-zinc-900">
        {children}
      </BackgroundGradient>
    </div>
  );
}
