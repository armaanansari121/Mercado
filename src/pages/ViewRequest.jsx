/* eslint-disable no-unused-vars */
// ViewRequest.jsx
import React from 'react';
import { ExpandableCardDemo } from '../components/ExpandableCardDemo';


const ViewRequest = () => {
  return (
    <>
          <style>
        {`
          /* Hide scrollbar but allow scrolling */
          ::-webkit-scrollbar {
            width: 10px; /* Width of the scrollbar */
            display: none; /* Hide scrollbar */
          }

          /* Track */
          ::-webkit-scrollbar-track {
            background: #f1f1f1; 
          }
          
          /* Handle */
          ::-webkit-scrollbar-thumb {
            background: #888; 
            border-radius: 5px; 
          }

          /* Handle on hover */
          ::-webkit-scrollbar-thumb:hover {
            background: #555; 
          }
        `}
      </style>
    <div className=
        "relative flex min-h-screen flex-col items-center justify-center overflow-y-scroll overflow-x-hidden z-[5000] bg-slate-950 w-full">
      <h1 className="text-3xl font-bold mb-4 text-slate-800">View Request</h1>
      <ExpandableCardDemo />
    </div>
    </>
  );
};

export default ViewRequest;