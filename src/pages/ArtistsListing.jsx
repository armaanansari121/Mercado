import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { cn } from "../utils/cn";
import { useStateContext } from "../contexts";
import ArtistRankingCard from "../components/ArtistRankingCard";

 function ArtistListing() {
  const { ArtistsContract, account } = useStateContext();
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistAddresses = await ArtistsContract.methods.getArtistAddresses().call();
        console.log("artistAddress",artistAddresses);
        const artistData = await Promise.all(
          artistAddresses.map(async (address) => {
            const { name, wallet, artCollection, nftMarkets, reputation } =
              await ArtistsContract.methods.getArtist(address).call();
            return {
              profileImage: "https://yellow-giant-angelfish-484.mypinata.cloud/ipfs/QmQBP2UD3cKX3J1NZRiKK7zTZfYstX16TepaQ1XJZPeUia",
              username: name,
              wallet,
              artCollection,
              nftMarkets,
              reputation: Number(reputation),
            };
          })
        );
        setArtists(artistData);
        setFilteredArtists(artistData);
      } catch (error) {
        console.error("Error fetching artist data:", error);
      }
    };

    if (ArtistsContract) {
      fetchArtists();
    }
  }, [ArtistsContract, account]);

  console.log("artists",artists);

  useEffect(() => {
    // Apply filtering and sorting when searchTerm or sortOption changes
    let filtered = artists.filter((artist) =>
      artist.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortOption) {
      case "default":
        // No sorting needed
        break;
      case "reputationHighToLow":
        filtered = filtered.sort((a, b) => b.reputation - a.reputation);
        break;
      case "reputationLowToHigh":
        filtered = filtered.sort((a, b) => a.reputation - b.reputation);
        break;
      default:
        break;
    }

    setFilteredArtists(filtered);
  }, [artists, searchTerm, sortOption]);

  return (
    <div
      className={cn(
        "relative overflow-hidden flex min-h-screen flex-col items-center justify-center z-[5000] bg-slate-950 w-full pt-20",
        "bg-cover bg-center",
        "bg-no-repeat"
      )}
      style={{
        backgroundImage: "url('/ArtistRanking.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-75 overflow-hidden"></div>
      <Navbar />
      <div className="flex z-10 ml-[-400px]  h-10 mt-[-230px] my-8">
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
          <option value="reputationHighToLow">Reputation: High to Low</option>
          <option value="reputationLowToHigh">Reputation: Low to High</option>
        </select>
      </div>
      <div
        className="px-16 bg-gray-800 rounded-t-lg"
        style={{ width: "50%" }}
      >
        <div className="flex justify-between py-4 text-lg font-semibold">
          <span className="text-white z-12">Artist</span>
          <span className="text-white z-12">Reputation</span>
          <span className="text-white z-12">NFT Markets</span>
        </div>
      </div>
      <div className="flex flex-col mt-0 z-10" style={{ width: "50%" }}>
        {filteredArtists.map((artist, index) => (
          <ArtistRankingCard
            key={index}
            profileImage={artist.profileImage}
            username={artist.username}
            wallet={artist.wallet}
            nftMarkets={artist.nftMarkets.length}
            reputation={artist.reputation}
          />
        ))}
      </div>
      <div className="absolute right-0 bottom-10">
        <img src="https://yellow-giant-angelfish-484.mypinata.cloud/ipfs/Qmcmf5RKJS3ntC5aJtjTW7wcb1e4Zk5cUybeADPx1cnndY" alt="" />
      </div>
    </div>
  );
}

export default ArtistListing;