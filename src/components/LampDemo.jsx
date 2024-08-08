import React from "react";
import { LampContainer } from "./LampContainer";
import Spline from "@splinetool/react-spline";

export function LampDemo() {
  return (
    <div className="relative">
      <LampContainer>
        <h1 className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          Mercado
        </h1>
        <h2 className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-2xl font-medium tracking-tight text-transparent md:text-2xl">
          Own the Future.
        </h2>
      </LampContainer>
      <Spline
        className="absolute top-0 right-0 bottom-0 left-0 z-10"
        scene="https://prod.spline.design/tHRctOE2M1c4bO6u/scene.splinecode"
      />
      <img src="logoHere2.png" alt="Logo" className="absolute w-96 h-58 bottom-0 right-0 mb-4 mr-4" />
    </div>
  );
}
