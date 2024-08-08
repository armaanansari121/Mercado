import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { cn } from "../utils/cn";
import RankingCard from "../components/RankingCard";

export function ArtistsListing() {
  // Dummy data for demonstration
  const initialArtists = [
    {
      profileImage: "/public/profile1.jpg",
      username: "Artist1",
      totalSold: 1000,
      highestSold: 500,
    },
    {
      profileImage: "/public/profile2.jpg",
      username: "Artist2",
      totalSold: 800,
      highestSold: 400,
    },
    {
      profileImage: "/public/profile3.jpg",
      username: "Artist3",
      totalSold: 750,
      highestSold: 480,
    },
    {
      profileImage: "/public/profile4.jpg",
      username: "Artist4",
      totalSold: 700,
      highestSold: 300,
    },
    {
      profileImage: "/public/profile5.jpg",
      username: "Artist5",
      totalSold: 680,
      highestSold: 350,
    },
    // Add more artists here...
  ];

  const [artists, setArtists] = useState(initialArtists);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    // Apply filtering and sorting when searchTerm or sortOption changes
    let filtered = initialArtists.filter((artist) =>
      artist.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "default":
        // No sorting needed
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

    setFilteredArtists(filtered);
  }, [initialArtists, searchTerm, sortOption]);

  return (
    <div
    className={cn(
        "relative overflow-hidden flex min-h-screen flex-col items-center justify-center z-[5000] bg-slate-950 w-full pt-20",
        "bg-cover bg-center",
        "bg-no-repeat"
      )}
      style={{
        backgroundImage: url("/ArtistRanking.jpg"),
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
          <option value="totalSoldHighToLow">Total Sold: High to Low</option>
          <option value="totalSoldLowToHigh">Total Sold: Low to High</option>
          <option value="highestSoldHighToLow">Highest Sold: High to Low</option>
          <option value="highestSoldLowToHigh">Highest Sold: Low to High</option>
        </select>
      </div>
      <div className="ml-8 mt-52 px-16 bg-gray-700 " style={{ width: "50%", position: "absolute", top: "0", left: "0" }}>
        <div className="text-slate-200 flex justify-items-start py-2 justify-between">
          <span>Artist</span>
          <span>Total sold</span>
          <span>Highest Sold</span>
        </div>
      </div>
      <div className="flex flex-col ml-[-220px] mt-24 z-10" style={{ width: "80%" }}>
        {/* Search and Sort Controls */}
        
        {/* Display Filtered Artists */}
        {filteredArtists.map((artist, index) => (
          <RankingCard
            key={index}
            profileImage={artist.profileImage}
            username={artist.username}
            totalSold={artist.totalSold}
            highestSold={artist.highestSold}
          />
        ))}
      </div>
      <div className="absolute right-0 bottom-10">
        <img src="/logoHere2.png" alt="" />
      </div>
   </div>
   );
}
