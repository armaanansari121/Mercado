import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BackgroundGradientDemo } from "../../components/BackgroundGradientDemo";
import Spline from "@splinetool/react-spline";
import { useStateContext } from "../../contexts";
import { Link } from "react-router-dom";

const Shop = () => {
  const [ethers, setEthers] = useState("");
  const [mercat, setMercat] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [balance, setBalance] = useState(null);

  const { MercatContract, account, ERC1155_CONTRACT } = useStateContext();
  console.log("ERC1155_CONTRACT", ERC1155_CONTRACT);
  console.log("MercatContract", MercatContract);

  const handlePurchase = async () => {
    if (!ethers || parseFloat(ethers) <= 0 || !account) {
      setErrorMessage(
        "Please enter valid values for SEPOLIA ethers and amount."
      );
      return;
    }

    try {
      const tsx = await ERC1155_CONTRACT.methods
        .convertETHToMERCAT()
        .send({ from: account, value: ethers * 1000000000000000000 });
      console.log(tsx);
      setEthers("");
      setErrorMessage("");
      updateBalance();
    } catch (error) {
      console.error("Purchase error:", error);
      setErrorMessage("Transaction failed. Please try again.");
    }
  };

  const handleSell = async () => {
    if (!mercat || parseFloat(mercat) <= 0 || !account) {
      setErrorMessage(
        "Please enter valid values for MERCAT tokens to sell."
      );
      return;
    }

    try {
      const tsx = await ERC1155_CONTRACT.methods
        .convertMERCATToETH(mercat * 1000000000000000000)
        .send({ from: account });
      console.log(tsx);
      setMercat("");
      setErrorMessage("");
      updateBalance();
    } catch (error) {
      console.error("Sell error:", error);
      setErrorMessage("Transaction failed. Please try again.");
    }
  };

  const updateBalance = async () => {
    if (account && MercatContract) {
      const balance = await MercatContract.methods.balanceOf(account).call();
      setBalance(Number(balance) / 1000000000000000000);
    }
  };

  useEffect(() => {
    updateBalance();
  }, [account, MercatContract]);

  return (
    <>
      <Spline
        className="absolute top-0 right-0 bottom-0 left-0"
        scene="https://prod.spline.design/5NCd3ur4F04VjwXu/scene.splinecode"
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 z-[5000]">
        <BackgroundGradientDemo>
          <div className="bg-gray-800 p-4 rounded-2xl shadow-lg w-96">
            <h1 className="text-2xl text-slate-100 font-semibold mb-4">
              MERCAT Token Exchange
            </h1>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <h2 className="mb-4 text-slate-500 text-xl">
              Price: 1 ETH = 100000 MEC
            </h2>
            <h2 className="text-slate-500 mb-4">
              Balance: {balance ? balance : 0} MEC
            </h2>

            <div className="mb-4">
              <label htmlFor="ethers" className="block mb-2 text-slate-500">
                Buy MERCAT (ETH):
              </label>
              <input
                type="number"
                id="ethers"
                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none focus:bg-gray-600 mb-2"
                placeholder="Enter SEPOLIA Ethers"
                value={ethers}
                onChange={(e) => setEthers(e.target.value)}
              />
              <motion.button
                whileHover={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.8)" }}
                className="w-full text-zinc-200 bg-transparent border border-zinc-200 hover:bg-neon-blue hover:text-white px-4 py-2 rounded-2xl transition duration-300"
                onClick={handlePurchase}
              >
                Buy MERCAT
              </motion.button>
            </div>

            <div className="mb-4">
              <label htmlFor="mercat" className="block mb-2 text-slate-500">
                Sell MERCAT (MEC):
              </label>
              <input
                type="number"
                id="mercat"
                className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none focus:bg-gray-600 mb-2"
                placeholder="Enter MERCAT to sell"
                value={mercat}
                onChange={(e) => setMercat(e.target.value)}
              />
              <motion.button
                whileHover={{ boxShadow: "0 0 20px rgba(255, 0, 0, 0.8)" }}
                className="w-full text-zinc-200 bg-transparent border border-zinc-200 hover:bg-red-500 hover:text-white px-4 py-2 rounded-2xl transition duration-300"
                onClick={handleSell}
              >
                Sell MERCAT
              </motion.button>
            </div>
          </div>
        </BackgroundGradientDemo>
      </div>
      <div className="absolute bottom-1 right-0">
        <Link to="/">
          <img src="https://yellow-giant-angelfish-484.mypinata.cloud/ipfs/Qmcmf5RKJS3ntC5aJtjTW7wcb1e4Zk5cUybeADPx1cnndY" alt="logo" />
        </Link>
      </div>
    </>
  );
};

export default Shop;