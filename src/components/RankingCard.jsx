import React from "react";

function RankingCard({ rank, profileImage, username, totalSold, highestSold }) {
  return (
    <div
      className="relative bg-gray-900 p-6 rounded-lg shadow-md mb-1"
      style={{ width: "100%" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-xl z-0"></div>
      <div
        className="relative z-10 flex justify-between items-center px-12 py-2 rounded-lg"
        style={{ boxShadow: "0 0 20px 5px rgba(255,255,255,0.5)" }}
      >
          <div className="text-white mr-4">{rank}</div>
        <div className="flex items-center mr-16">
          <img
            src={profileImage}
            alt={`${username}'s profile`}
            className="h-10 w-10 rounded-full border-2 p-0 m-0 border-gray-800"
          />
          <span className="ml-4 text-white">{username}</span>
        </div>
        <div className="text-white mr-24">{totalSold}</div>
        <div className="text-white">{highestSold}</div>
      </div>
    </div>
  );
}

export default RankingCard;
