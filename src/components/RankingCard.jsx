import React from "react";

function RankingCard({ rank, profileImage, username, totalSold, highestSold }) {
  return (
    <div
      className=" relative bg-gray-900  p-6 rounded-lg shadow-md mb-1"
      style={{ width: "60%"}}
    >
      <div className="  inset-0 bg-gradient-to-b  from-gray-700 via-gray-800 to-gray-900 rounded-xl z-0"></div>
      <div
        className="relative z-10 flex justify-items-start justify-between rounded-lg"
        style={{ boxShadow: "0 0 20px 5px rgba(255,255,255,0.5)", left: 0 }}
      >
        {rank && <div className="ml-4  text-white">{rank}</div>}

        <div className=" text-white flex flex-row justify-between">
          <div className="">
            <img
              src={profileImage}
              alt={`${username}'s profile`}
              className="h-10 w-10 rounded-full border-2 p-0 m-0 border-gray-800"
            />
          </div>
          <span className="ml-1 pl-1"> {username} </span>
        </div>
        <div className="ml-4  text-white">
          <span> {totalSold}</span>
        </div>
        <div className=" text-white mr-2">
          <span> {highestSold}</span>
        </div>
      </div>
    </div>
  );
}

export default RankingCard;
