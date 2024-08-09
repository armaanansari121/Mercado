/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { LampDemo } from "./components/LampDemo";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import Web3 from "web3";
import { createThirdwebClient, getContract, resolveMethod } from "thirdweb";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStateContext } from "./contexts";
import Shop from "./web3/pages/Shop";
import ConnectWalletButton from "./components/ConectButton";
import CreateNFT from "./web3/pages/CreateNFT";
// create the client with your clientId, or secretKey if in a server environment

import ArtistProfile from "./pages/ArtistProfile";
import CreatorProfile from "./pages/CreatorProfile";
import { Marketplace } from "./pages/Marketplace";
import { MainMarket } from "./pages/MainMarket";
import {
  ERC1155_CONTRACT_ADDRESS,
  MERCAT_CONTRACT_ADDRESS,
  ARTISTS_CONTRACT_ADDRESS,
} from "./web3/constants";
import ERC1155_ABI from "../src/web3/ABIs/ERC1155_ABI.json";
import Mercat_ABI from "../src/web3/ABIs/Mercat_ABI.json";
import Artists_ABI from "../src/web3/ABIs/Artists_ABI.json";
import { CreatorsRanking } from "./pages/CreatorsRanking";
import ArtistsListing from "./pages/ArtistsListing";
import ViewRequestOptions from "./pages/ViewRequestOptions";
import MyRequests from "./pages/MyRequests";
import AllRequests from "./pages/AllRequests";

export const client = createThirdwebClient({
  clientId: "279bdbf9028501a51bf797ada51321ac",
});

// connect to your contract
// export const contract = getContract({
//   client,
//   chain: sepolia,
//   address: "0x..."
// });

window.ethereum.on("accountsChanged", (accounts) => {
  // reload the page to get the latest account
  window.location.reload();
  console.log("accounts changed", accounts);
});

window.ethereum.on("chainChanged", (chainId) => {
  // reload the page to get the latest account
  window.location.reload();
  console.log("chain changed", chainId);
});

function App() {
  const {
    setERC1155_CONTRACT,
    setAccount,
    setArtistsContract,
    setMercatContract,
  } = useStateContext();
  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window.ethereum !== "undefined") {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          // Initialize ERC1155 contract
          const erc1155Contract = new web3.eth.Contract(
            ERC1155_ABI,
            ERC1155_CONTRACT_ADDRESS
          );
          setERC1155_CONTRACT(erc1155Contract);

          // Initialize Mercat contract
          const mercatContract = new web3.eth.Contract(
            Mercat_ABI,
            MERCAT_CONTRACT_ADDRESS
          );
          setMercatContract(mercatContract);

          // Initialize Artists contract
          const artistsContract = new web3.eth.Contract(
            Artists_ABI,
            ARTISTS_CONTRACT_ADDRESS
          );
          setArtistsContract(artistsContract);
        } catch (error) {
          console.error(error);
        }
      } else {
        alert("Please install MetaMask");
      }
    };
    initializeWeb3();
  }, []);

  return (
    <ThirdwebProvider client={client}>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<LampDemo />} />
          <Route path="/CreatorsRanking" element={<CreatorsRanking />} />
          <Route path="/ArtistsListing" element={<ArtistsListing />} />
          <Route path="/MainMarket" element={<MainMarket />} />
          <Route path="/Marketplace" element={<Marketplace />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/about" element={<LampDemo />} />
          <Route path="/contact" element={<LampDemo />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/createNFT" element={<CreateNFT />} />
          <Route path="/creatorProfile" element={<CreatorProfile />} />
          <Route path="/artistProfile" element={<ArtistProfile />} />
          <Route path="/allRequests" element={<AllRequests />} />
          <Route
            path="/viewOptions/:requestId"
            element={<ViewRequestOptions />}
          />
          <Route path="/myRequests" element={<MyRequests />} />
        </Routes>

        <ConnectWalletButton />
      </div>
    </ThirdwebProvider>
  );
}

export default App;
