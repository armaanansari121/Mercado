import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { cn } from "../utils/cn";
import { useStateContext } from "../contexts";
import RankingCard from "../components/RankingCard";

export function CreatorsRanking() {
  const { ArtistsContract, account } = useStateContext();
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const creatorAddresses = await ArtistsContract.methods.getCreatorAddresses().call();
        
        const creatorData = await Promise.all(
          creatorAddresses.map(async (address, index) => {
            const { name, wallet, artworks, reputation } =
              await ArtistsContract.methods.getCreator(address).call();
    
            // Convert BigInt values to Number
            const highestSold = artworks.length > 0 
              ? Number(Math.max(...artworks.map((art) => Number(art.value))))
              : 0;
    
            return {
              rank: index + 1,
              profileImage: "https://yellow-giant-angelfish-484.mypinata.cloud/ipfs/QmQBP2UD3cKX3J1NZRiKK7zTZfYstX16TepaQ1XJZPeUia",
              username: name,
              wallet,
              artCollection: artworks,
              reputation: Number(reputation),
              totalSold: artworks.length,
              highestSold: highestSold,
            };
          })
        );
    
        setCreators(creatorData);
        setFilteredCreators(creatorData);
      } catch (error) {
        console.error("Error fetching creator data:", error);
      }
    };


    if (ArtistsContract) {
      fetchCreators();
    }
  }, [ArtistsContract, account]);

  useEffect(() => {
    let filtered = creators.filter((creator) =>
      creator.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "default":
        filtered = filtered.sort((a, b) => a.rank - b.rank);
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
  }, [creators, searchTerm, sortOption]);

  return (
    <>
      {/* ...style and other JSX elements remain unchanged... */}
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
        <div className="flex z-10 ml-[-400px] h-10 mt-[-230px] my-8">
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            style={{
              backgroundColor: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "4px",
              padding: "8px",
              width: "100%",
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 mr-2"
          />
          <select
            value={sortOption}
            style={{
              backgroundColor: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "4px",
              padding: "8px",
              width: "100%",
            }}
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
        <div
          className="px-16 bg-gray-800 rounded-t-lg"
          style={{ width: "50%" }}
        >
          <div className="flex justify-between py-4 text-lg font-semibold">
            <span className="text-white z-12">Rank</span>
            <span className="text-white z-12">Creator</span>
            <span className="text-white z-12">Total Sold</span>
            <span className="text-white z-12">Highest Sold</span>
          </div>
        </div>
        <div className="flex flex-col mt-0 z-10" style={{ width: "50%" }}>
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
          <img src="https://yellow-giant-angelfish-484.mypinata.cloud/ipfs/Qmcmf5RKJS3ntC5aJtjTW7wcb1e4Zk5cUybeADPx1cnndY" alt="" />
        </div>
      </div>
    </>
  );
}
