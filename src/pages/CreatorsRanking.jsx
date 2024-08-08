import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { cn } from "../utils/cn";
import RankingCard from "../components/RankingCard";

export function CreatorsRanking() {
  // Dummy data for demonstration
  const initialCreators = [
    {
      rank: 1,
      profileImage: "/public/profile1.jpg",
      username: "User1",
      totalSold: 1000,
      highestSold: 500,
    },
    {
      rank: 2,
      profileImage: "/public/profile2.jpg",
      username: "User2",
      totalSold: 800,
      highestSold: 400,
    },
    {
      rank: 3,
      profileImage: "/public/profile3.jpg",
      username: "User3",
      totalSold: 750,
      highestSold: 480,
    },
    {
      rank: 4,
      profileImage: "/public/profile4.jpg",
      username: "User4",
      totalSold: 700,
      highestSold: 300,
    },
    {
      rank: 5,
      profileImage: "/public/profile5.jpg",
      username: "User5",
      totalSold: 680,
      highestSold: 350,
    },
    {
      rank: 6,
      profileImage: "/public/profile6.jpg",
      username: "User6",
      totalSold: 650,
      highestSold: 320,
    },
    // Add more creators here...
  ];

  const [creators, setCreators] = useState(initialCreators);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    // Apply filtering and sorting when searchTerm or sortOption changes
    let filtered = initialCreators.filter((creator) =>
      creator.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "default":
        // No sorting needed
        break;
      case "rankAscending":
        filtered = filtered.sort((a, b) => a.rank - b.rank);
        break;
      case "rankDescending":
        filtered = filtered.sort((a, b) => b.rank - a.rank);
        break;
      case "totalSoldHighToLow":
        filtered = filtered.sort((a, b) => b.totalSold - a.totalSold);
        break;
      case "totalSoldLowToHigh":
        filtered = filtered.sort((a, b) => a.totalSold - b.totalSold);
        break;
      case "highestSoldHighToLow":
        filtered = filtered.sort((a, b) => b.highestSold - a.highestSold);
        break;
      case "highestSoldLowToHigh":
        filtered = filtered.sort((a, b) => a.highestSold - b.highestSold);
        break;
      default:
        break;
    }

    setFilteredCreators(filtered);
  }, [initialCreators, searchTerm, sortOption]);

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

    <div
      className={cn(
        "relative overflow-hidden flex min-h-screen flex-col items-center justify-center z-[5000] bg-slate-950 w-full pt-20",
        "bg-cover bg-center",
        "bg-no-repeat"
      )}
      style={{
        backgroundImage: `url("/public/CreatorRanking.jpg")`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-75 overflow-hidden"></div>
      <Navbar />
      <div className="flex z-10 ml-[-400px] h-10 my-8">
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px", padding: "8px", width:"100%"}}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 mr-2"
          />
          <select
            value={sortOption}
            style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px", padding: "8px", width:"100%"}}
            onChange={(e) => setSortOption(e.target.value)}
            className="border p-2"
          >
            <option value="default">Default Sorting</option>
            <option value="rankAscending">Rank: Ascending</option>
            <option value="rankDescending">Rank: Descending</option>
            <option value="totalSoldHighToLow">Total Sold: High to Low</option>
            <option value="totalSoldLowToHigh">Total Sold: Low to High</option>
            <option value="highestSoldHighToLow">Highest Sold: High to Low</option>
            <option value="highestSoldLowToHigh">Highest Sold: Low to High</option>
          </select>
        </div>
      <div className="ml-8 mt-52 bg-gray-700 px-10" style={{ width: "50%", position: "absolute", top: "0", left: "0" }}>
        <div className="text-slate-200 flex justify-items-start py-2 justify-between">
          <span className="ml-2">Rank</span>
          <span>Creator</span>
          <span>Total sold</span>
          <span className="mr-2">Highest Sold</span>
        </div>
      </div>
      <div className="flex flex-col ml-[-220px] mt-24 z-10" style={{ width: "80%" }}>
        {/* Search and Sort Controls */}
        
        {/* Display Filtered Creators */}
        {filteredCreators.map((creator, index) => (
          <RankingCard
            key={index}
            rank={creator.rank}
            profileImage={creator.profileImage}
            username={creator.username}
            totalSold={creator.totalSold}
            highestSold={creator.highestSold}
          />
        ))}
      </div>
      <div className="absolute right-0 bottom-10">
        <img src="/logoHere2.png" alt="" />
      </div>
    </div>
    </>
  );
}
