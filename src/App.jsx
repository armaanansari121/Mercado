/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { LampDemo } from "./components/LampDemo";
import { Navbar } from "./components/Navbar";
import {Home} from "./pages/Home";
import Web3 from "web3"
import { createThirdwebClient, getContract, resolveMethod } from "thirdweb";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStateContext } from "./contexts";
import Shop from "./web3/pages/Shop";
import ConnectWalletButton from "./components/ConectButton";
import CreateNFT from "./web3/pages/CreateNFT";
// create the client with your clientId, or secretKey if in a server environment

import ArtistProfile from "./Pages/ArtistProfile";
import CreatorProfile from "./Pages/CreatorProfile";
import { Marketplace } from "./Pages/Marketplace";
import { MainMarket } from "./Pages/MainMarket";
import { ERC1155_CONTRACT_ADDRESS, MERCAT_CONTRACT_ADDRESS } from "./web3/constants";
import ERC1155_ABI from "../src/web3/ABIs/ERC1155_ABI.json";
import Mercat_ABI from "../src/web3/ABIs/Mercat_ABI.json";
import { CreatorsRanking } from "./Pages/CreatorsRanking";
import { ArtistsListing } from "./Pages/ArtistsListing";
import ViewRequest from "./Pages/ViewRequest";



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

  const { setERC1155_CONTRACT, setAccount,setMercatContract } = useStateContext();

  useEffect(() => {
    // Check MetaMask availability and initialize web3
    const initializeWeb3 = async () => {
        if (typeof window.ethereum !== "undefined") {
            const web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
                const contract = new web3.eth.Contract(
                    ERC1155_ABI,
                    ERC1155_CONTRACT_ADDRESS
                );
                setERC1155_CONTRACT(contract);
            } catch (error) {
                console.error(error);
            }
        } else {
            alert("Please install MetaMask");
        }
    };
    initializeWeb3();
  }, []);


  useEffect(() => {
    const initializeWeb3 = async () => {
      if (typeof window.ethereum !== "undefined") {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
          const contract = new web3.eth.Contract(
            Mercat_ABI,
            MERCAT_CONTRACT_ADDRESS
          );
          setMercatContract(contract);
        } catch (error) {
          console.error(error);
        }
      } else {
        alert("Please install Metamask");
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
          {/* <Route path="/CreatorsRanking" element={<CreatorsRanking />} /> */}
          <Route path="/ArtistsListing" element={<ArtistsListing />} />
          <Route path="/MainMarket" element={<MainMarket />} />
          <Route path="/Marketplace" element={<Marketplace />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/about" element={<LampDemo />} />
          <Route path="/contact" element={<LampDemo />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/createNFT" element={<CreateNFT />} />
          {/* <Route path="/creatorProfile" element={<CreatorProfile />} /> */}
          <Route path="/artistProfile" element={<ArtistProfile />} />
          <Route path="/ViewRequest" element={<ViewRequest/>}/>
        </Routes>

        <ConnectWalletButton />

        
      </div>
    </ThirdwebProvider>
  );
}

export default App;
