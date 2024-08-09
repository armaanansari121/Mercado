import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

import { BackgroundGradientDemo } from "../components/BackgroundGradientDemo";
import { Using3dCard } from "../components/Using3dCard";
import { useStateContext } from "../contexts";
import { getMetadata } from "../utils/web3Helpers";
import { Gateway_url } from "../../config";
import { ARTISTS_CONTRACT_ADDRESS } from "../web3/constants";

export function MainMarket() {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [shadowColor, setShadowColor] = useState("#00ffff");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageDetails, setSelectedImageDetails] = useState({
    name: "",
    description: "",
    price: "",
    artist: "",
    perks: "",
    image: "",
    ipfsHash: "",
    countNFTs: 0,
    token_id: 0,
    creator: "",
  });
  const [Buyloading, setBuyLoading] = useState(false);
  const [Sellloading, setSellLoading] = useState(false);
  const location = useLocation();
  const { ERC1155_CONTRACT, account, priceData, setPriceData } =
    useStateContext();
  const [metadata, setMetadata] = useState([]);
  const [filteredMetadata, setFilteredMetadata] = useState([]);
  const [purchaseAmount, setPurchaseAmount] = useState(1);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const totalIDs = await ERC1155_CONTRACT.methods.nextTokenId().call();
        const totalNFTs = parseInt(totalIDs) - 1;
        const metadataArray = [];
        for (let i = 1; i <= totalNFTs; i++) {
          const ipfsHash = await ERC1155_CONTRACT.methods
            .tokenIdToIpfsHash(i)
            .call();
          const NFTDetails = await ERC1155_CONTRACT.methods
            .getMarketDetails(ipfsHash)
            .call();
          const Metadata = await getMetadata(Gateway_url, ipfsHash);
          const updatedPrice = await ERC1155_CONTRACT.methods
            .getNFTPrice(ipfsHash)
            .call();
          metadataArray.push({
            name: NFTDetails[0],
            description: NFTDetails[1],
            theme: NFTDetails[2],
            image: Metadata.image,
            ipfsHash: ipfsHash,
            price: Number(updatedPrice),
            perks: NFTDetails[5],
            creator: NFTDetails[6],
            countNFTs: Number(NFTDetails[7]),
            token_id: i,
          });
        }
        console.log("metadataArray", metadataArray);
        setMetadata(metadataArray);
        setFilteredMetadata(metadataArray);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, [ERC1155_CONTRACT, account]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const theme = params.get("theme");

    let filteredData = theme
      ? metadata.filter((item) => item.theme === theme)
      : [...metadata];
    setFilteredMetadata(filteredData);

    switch (theme) {
      case "Music":
        setBackgroundImage("/public/imageMusic.jpg");
        setShadowColor("#39ff14");
        break;
      case "Gaming":
        setBackgroundImage("/public/imageGaming.jpg");
        setShadowColor("#00ffff");
        break;
      case "Arts":
        setBackgroundImage("/public/imageArts.jpg");
        setShadowColor("#F535AA");
        break;
      default:
        setBackgroundImage("");
        break;
    }
  }, [location.search, metadata]);

  const fetchUserBalance = async (ipfsHash) => {
    try {
      const tokenId = await ERC1155_CONTRACT.methods
        .getTokenIdFromIpfsHash(ipfsHash)
        .call();
      const balance = await ERC1155_CONTRACT.methods
        .balanceOf(account, tokenId)
        .call();
      setUserBalance(parseInt(balance));
    } catch (error) {
      console.error("Error fetching user balance:", error);
      setUserBalance(0);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    const selectedMetadata = filteredMetadata.find(
      (item) => item.image === image
    );
    setSelectedImageDetails(selectedMetadata || {});
    if (selectedMetadata) {
      fetchUserBalance(selectedMetadata.ipfsHash);
    }
  };

  const handleBuy = async () => {
    if (selectedImageDetails.price && selectedImageDetails.image) {
      //ftech current price then push it to the price array
      const currentPrice = await ERC1155_CONTRACT.methods
        .getNFTPrice(selectedImageDetails.ipfsHash)
        .call();
      setPriceData((prevData) => [...prevData, currentPrice.toNumber()]);
      try {
        setBuyLoading(true);
        const amount = parseInt(purchaseAmount);

        const txn = await ERC1155_CONTRACT.methods
          .mint(ARTISTS_CONTRACT_ADDRESS, selectedImageDetails.ipfsHash, amount)
          .send({ from: account });

        setBuyLoading(false);
        alert("Purchase successful!");
        await fetchUserBalance(selectedImageDetails.ipfsHash);

        const updatedMetadata = [...metadata];
        const index = updatedMetadata.findIndex(
          (item) => item.token_id === selectedImageDetails.token_id
        );
        if (index !== -1) {
          setMetadata(updatedMetadata);
          setFilteredMetadata(
            location.search
              ? updatedMetadata.filter(
                  (item) =>
                    item.theme ===
                    new URLSearchParams(location.search).get("theme")
                )
              : updatedMetadata
          );
        }
      } catch (error) {
        setBuyLoading(false);
        console.error("Error purchasing NFT:", error);
        alert("Error purchasing NFT. Please try again.");
      }
    } else {
      alert("Invalid NFT details. Please select a valid NFT.");
    }
  };

  const handleSell = async () => {
    if (selectedImageDetails.token_id) {
      //ftech current price then push it to the price array
      const currentPrice = await ERC1155_CONTRACT.methods
        .getNFTPrice(selectedImageDetails.ipfsHash)
        .call();
      setPriceData((prevData) => [...prevData, Number(currentPrice)]);
      try {
        setSellLoading(true);
        const amount = parseInt(purchaseAmount);

        const txn = await ERC1155_CONTRACT.methods
          .sell(ARTISTS_CONTRACT_ADDRESS, selectedImageDetails.ipfsHash, amount)
          .send({ from: account });
        setSellLoading(false);
        alert("Sale successful!");
        await fetchUserBalance(selectedImageDetails.ipfsHash);

        const updatedMetadata = [...metadata];
        const index = updatedMetadata.findIndex(
          (item) => item.token_id === selectedImageDetails.token_id
        );
        if (index !== -1) {
          setMetadata(updatedMetadata);
          setFilteredMetadata(
            location.search
              ? updatedMetadata.filter(
                  (item) =>
                    item.theme ===
                    new URLSearchParams(location.search).get("theme")
                )
              : updatedMetadata
          );
        }
      } catch (error) {
        setSellLoading(false);
        console.error("Error selling NFT:", error);
        alert("Error selling NFT. Please try again.");
      }
    } else {
      alert("Invalid NFT details. Please select a valid NFT.");
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden flex min-h-screen flex-col items-center justify-center z-[5000] bg-slate-950 w-full pt-20",
        backgroundImage && "bg-cover bg-center bg-no-repeat bg-fixed"
      )}
      style={
        backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}
      }
    >
      <div className="absolute inset-0 bg-black opacity-75 overflow-hidden"></div>
      <Navbar />
      <div className="p-0 size-72 absolute left-0 top-0 ml-0">
        <img src="public/logoHere2.png" alt="" />
      </div>
      <div className="flex justify-center items-center z-10">
        <div
          className="MarketSectionContainer ml-64 border border-gray-500 rounded-md"
          style={{
            width: "60%",
            backgroundColor: "rgba(169, 169, 169, 0.2)",
            boxShadow: `inset 0 0 18px ${shadowColor}, 0 0 35px rgba(150, 150, 150, 0.5)`,
            overflowY: "auto",
          }}
        >
          <div
            className="MarketSection grid grid-cols-3 gap-10 p-8 pr-2 pb-3"
            style={{ width: "850px", height: "600px" }}
          >
            {filteredMetadata.map((item, index) => (
              <div className="flex justify-center" key={index}>
                <BackgroundGradientDemo>
                  <div className="">
                    <img
                      src={item?.image}
                      alt={item?.name}
                      style={{ width: "300px", height: "250px" }}
                      onClick={() => handleImageClick(item?.image)}
                    />
                  </div>
                </BackgroundGradientDemo>
              </div>
            ))}
          </div>
        </div>

        <div
          className="CartSection overflow-x-hidden p-0 ml-1 mr-16 border border-gray-500 rounded-md"
          style={{
            height: "650px",
            width: "450px",
            boxShadow: "0 4px 6px rgba(255, 255, 255, 0.8)",
            overflowY: "scroll",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(0, 0, 0, 0.5) rgba(255, 255, 255, 0.3)",
          }}
        >
          <div className="flex justify-center items-center mt-4">
            <p className="text-neutral-200 text-2xl">CART</p>
          </div>
          <div className="flex justify-center">
            {selectedImage && <Using3dCard src={selectedImage} title="NFT" />}
          </div>
          {selectedImage && (
            <>
              <div className="Details">
                <div className="text-neutral-200 text-2xl mb-4">
                  Name:{" "}
                  <span className="text-neutral-500">
                    {selectedImageDetails?.name}
                  </span>
                </div>
                <div className="text-neutral-200 text-2xl mt-4 mb-4">
                  Description:{" "}
                  <span className="text-neutral-500">
                    {selectedImageDetails?.description}
                  </span>
                </div>
                <div className="text-neutral-200 text-2xl mt-4 mb-4">
                  Price:{" "}
                  <span className="text-neutral-500">
                    {selectedImageDetails?.price} MEC
                  </span>
                </div>
                <div className="text-neutral-200 text-2xl mt-4 mb-4">
                  MintedNFTs:{" "}
                  <span className="text-neutral-500">
                    {selectedImageDetails?.countNFTs}
                  </span>
                </div>
                <div className="text-neutral-200 text-2xl mt-4 mb-4">
                  Balance:{" "}
                  <span className="text-neutral-500">{userBalance}</span>
                </div>
                <div className="text-neutral-200 text-2xl mt-4 mb-4">
                  Artist:{" "}
                  <span className="text-neutral-500">
                    {selectedImageDetails?.creator}
                  </span>
                </div>
                <div className="text-neutral-200 text-2xl mt-4 mb-4">
                  Perks:{" "}
                  <span className="text-neutral-500">
                    {selectedImageDetails?.perks}
                  </span>
                </div>
              </div>

              <div className="AmountInput flex justify-center items-center mt-4">
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Enter amount"
                  style={{
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    padding: "8px",
                    width: "70%",
                  }}
                />
              </div>
              <div className="flex gap-28 justify-center">
                <div className="Purchase flex justify-center items-center mt-4">
                  {Buyloading ? (
                    <div className="text-slate-100 flex justify-center items-center">
                      <div
                        className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                      ></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{
                        boxShadow: "0 0 10px 3px rgba(255, 255, 255, 0.7)",
                        transform: "translateY(-2px)",
                      }}
                      className="block my-4 p-3 px-6 text-white rounded-2xl hover:bg-[#7c1485] transition-all duration-200"
                      style={{ backgroundColor: "#92199f" }}
                      onClick={handleBuy}
                    >
                      Buy
                    </motion.button>
                  )}
                </div>
                <div className="Sell flex justify-center items-center mt-4">
                  {Sellloading ? (
                    <div className="text-slate-100 flex justify-center items-center">
                      <div
                        className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                      ></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{
                        boxShadow: "0 0 10px 3px rgba(255, 255, 255, 0.7)",
                        transform: "translateY(-2px)",
                      }}
                      className="block my-4 p-3 px-6 text-white rounded-2xl hover:bg-[#FF6B6B] transition-all duration-200"
                      style={{ backgroundColor: "#FF4D4D" }}
                      onClick={handleSell}
                    >
                      Sell
                    </motion.button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
