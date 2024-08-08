import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

import { BackgroundGradientDemo } from "../components/BackgroundGradientDemo";
import { Using3dCard } from "../components/Using3dCard";
import GlowingButton from "../components/GlowingButton";
// import Loader from "../components/Loader";// Import your Loader component
import { useStateContext } from "../contexts";
import { getMetadata } from "../utils/web3Helpers";
import { Gateway_url } from "../../config";

export function MainMarket() {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [shadowColor, setShadowColor] = useState("#00ffff");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageDetails, setSelectedImageDetails] = useState({
    name: "",
    description: "",
    price: "",
    creator: "",
    owner: "",
    available: "",
  });
  const [loading, setLoading] = useState(false); // Loading state
  const location = useLocation();
  const { ERC1155_CONTRACT, MercatContract, account } = useStateContext();
  const [metadata, setMetadata] = useState([]);
  const [filteredMetadata, setFilteredMetadata] = useState([]);
  const [purchaseAmount, setPurchaseAmount] = useState(1); // State to hold the purchase amount

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const hashes = await ERC1155_CONTRACT.methods.getAll().call();
        const metadataArray = [];
        for (let i = 0; i < hashes.length; i++) {
          const data = await getMetadata(Gateway_url, hashes[i]);
          const token_id = Number(
            await ERC1155_CONTRACT.methods.getTokenIdByURI(hashes[i]).call()
          );
          const ownerOfThisNFT = await ERC1155_CONTRACT.methods
            .tokenIDtoHolderFn(token_id)
            .call();
          const NFTamount = Number(
            await ERC1155_CONTRACT.methods
              .balanceOf(ownerOfThisNFT[0], token_id)
              .call()
          );
          const nftDetails = {
            name: data.name,
            description: data.description,
            price: data.price,
            theme: data.theme,
            image: data.image,
            creator: data.creator,
            owner: ownerOfThisNFT[0],
            available: NFTamount,
            token_id: token_id,
          };

          metadataArray.push(nftDetails);
        }
        setMetadata(metadataArray);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, [ERC1155_CONTRACT]);
  

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const theme = params.get("theme");

    let filteredData = [];
    if (theme) {
      filteredData = metadata.filter((item) => item.theme === theme);
    } else {
      filteredData = [...metadata];
    }
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

  const handleImageClick = async (image) => {
    setSelectedImage(image);

    const selectedMetadata = filteredMetadata.find(
      (item) => item.image === image
    );

    // Update selected image details state
    setSelectedImageDetails({
      name: selectedMetadata?.name || "",
      description: selectedMetadata?.description || "",
      price: selectedMetadata?.price || "",
      creator: selectedMetadata?.creator || "",
      owner: selectedMetadata?.owner || "",
      available: selectedMetadata?.available || "",
      token_id: selectedMetadata?.token_id || "",
    });
  };

  const handleBuy = async () => {
    if (selectedImageDetails.price && selectedImageDetails.owner) {
      try {
        setLoading(true); // Start loading
  
        const amount = parseInt(purchaseAmount);
        const calculatedPrice = selectedImageDetails.price * amount;
  
        // Request user's permission to interact with MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
  
        // Send transaction to MercatContract
        const txn = await MercatContract.methods
          .transferWithInfiniteAllowance(selectedImageDetails.owner, calculatedPrice)
          .send({ from: account });
  
        console.log("Transaction Hash:", txn.transactionHash);
        alert("Transaction completed!");
        // After transaction is successful, transfer NFT to user's account
        await ERC1155_CONTRACT.methods
          .transfer(account, selectedImageDetails.token_id, amount)
          .send({ from: selectedImageDetails.owner });
        
        setLoading(false); // Stop loading
        alert("Purchase successful!");
      } catch (error) {
        setLoading(false); // Stop loading on error
        console.error("Error purchasing NFT:", error);
        alert("Error purchasing NFT. Please try again.");
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
                  Amount:{" "}
                  <span className="text-neutral-500">
                    {selectedImageDetails?.available}
                  </span>
                </div>
                <div className="text-neutral-200 text-2xl mt-4 mb-4">
                  Creator:{" "}
                  <span className="text-neutral-500">
                    {selectedImageDetails?.creator}
                  </span>
                </div>
                <div className="text-neutral-200 text-2xl mt-4 mb-4">
                  Owner:{" "}
                  <span className="text-neutral-500">
                    {selectedImageDetails?.owner}
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
              <div className="Purchase flex justify-center items-center mt-4">
                {loading ? (
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
                    }}
                    className="block my-4 p-2 text-white rounded-2xl"
                    style={{ backgroundColor: "#92199f" }}
                    onClick={handleBuy}
                  >
                    Make Purchase
                  </motion.button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
