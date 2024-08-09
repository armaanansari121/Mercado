/* eslint-disable no-unused-vars */
// ViewRequestOptions.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStateContext } from "../contexts";
import { ExpandableCardDemo } from "../components/ExpandableCardDemo";
import { Gateway_url } from "../../config";
import AnimatedText from "../components/AnimatedDiv";
import { cn } from "../utils/cn";

const ViewRequestOptions = () => {
  const { requestId } = useParams();
  const { ArtistsContract, account } = useStateContext();
  const [options, setOptions] = useState([]);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestAndOptions = async () => {
      try {
        const requestData = await ArtistsContract.methods
          .artRequests(requestId)
          .call();
        setRequest(requestData);

        const optionsData = await ArtistsContract.methods
          .getArtOptions(requestId)
          .call();
        setOptions(optionsData);
      } catch (error) {
        console.error("Error fetching request and options:", error);
      } finally {
        setLoading(false);
      }
    };

    if (ArtistsContract && requestId) {
      fetchRequestAndOptions();
    }
  }, [ArtistsContract, requestId]);

  const handleFulfillRequest = async (optionIndex) => {
    try {
      await ArtistsContract.methods
        .fulfillRequest(requestId, optionIndex)
        .send({ from: account });
      alert("Request fulfilled successfully!");
      // Optionally, you can refresh the options or redirect the user
    } catch (error) {
      console.error("Error fulfilling request:", error);
      alert("Error fulfilling request. Please try again.");
    }
  };

 

  const cards = options.map((option, index) => ({
    description: `Option ${index + 1}`,
    title: `Art Option ${index + 1}`,
    src: `${Gateway_url}/ipfs/${option.ipfsHash}`,
    ctaText: "Fulfill Request",
    ctaLink: "#",
    content: () => (
      <div className="text-slate-400">
        <p>Creator: {option.creator}</p>
        <p>IPFS Hash: {option.ipfsHash}</p>
        <button
          onClick={() => handleFulfillRequest(index)}
          className="mt-4 px-4 py-2 bg-gradient-to-br from-cyan-900 to-blue-900 text-slate-200 rounded-md hover:from-cyan-800 hover:to-blue-800 transition-colors shadow-[0px_1px_0px_0px_#1e40af40_inset,0px_-1px_0px_0px_#1e40af40_inset]"
        >
          Fulfill Request
        </button>
      </div>
    ),
  }));

  return (
    <div
      className={cn(
        "relative h-screen flex min-h-screen flex-col items-center justify-evenly overflow-y-scroll overflow-x-hidden z-[5000] bg-slate-950 w-full"
      )}
    >
      <AnimatedText>
        <h1 className="text-3xl font-bold text-slate-200">
          View Request Options
        </h1>
      </AnimatedText>
      {request && (
        <AnimatedText>
          <h2 className="text-2xl font-semibold text-slate-200">
            Request Details
          </h2>
          <p>Description: {request.description}</p>
          <p>Price: {request.price} MER</p>
          <p>Artist: {request.artist}</p>
          <p>Fulfilled: {request.fulfilled ? "Yes" : "No"}</p>
        </AnimatedText>
      )}
      <div className="scroll-auto">
        {options.length > 0 ? (
          <ExpandableCardDemo cards={cards} />
        ) : (
          <p className="text-slate-400">
            No options available for this request.
          </p>
        )}
      </div>
    </div>
  );
};

export default ViewRequestOptions;
