import React from "react";
import { CardBody, CardContainer, CardItem } from "./3dCard";

export function Using3dCard({ src, title }) {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-[#3b3b3b62] relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[25rem] h-auto rounded-xl p-6 border flex flex-col justify-center items-center">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600"
        >
          {title}
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-2 flex justify-center">
          <img
            src={src}
            className="max-h-60 max-w-full h-auto w-auto object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
