import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import WalletIcon from "/public/wallet-svgrepo-com.svg";
import { NavbarItem } from "./NavbarItem";
import { useStateContext } from "../contexts";

export const Navbar = ({className}) => {
  const { ArtistsContract, account } = useStateContext();
  const [isArtist, setIsArtist] = useState(false);
  const [navItems, setNavItems] = useState([
    {
      name: "Home",
      link: "/Home",
    },
    {
      name: "Shop",
      link: "/shop",
    },
    {
      name: "MarketPlace",
      link: "/Marketplace",
    },
    {
      name: "Create NFT",
      link: "/CreateNFT",
    },
  ]);

  useEffect(() => {
    const checkArtistStatus = async () => {
      if (ArtistsContract && account) {
        try {
          const artistData = await ArtistsContract.methods.getArtist(account).call();
          setIsArtist(artistData.wallet !== "0x0000000000000000000000000000000000000000");
        } catch (error) {
          console.error("Error checking artist status:", error);
          setIsArtist(false);
        }
      }
    };

    checkArtistStatus();
  }, [ArtistsContract, account]);

  const filteredNavItems = isArtist 
  ? navItems 
  : navItems.filter(item => item.link !== "/CreateNFT");

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 1,
          y: 0,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-[#000000] bg-[#1f1313] shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4 p-2",
          className
        )}
      >
        {filteredNavItems.map((navItem) => (
          <NavbarItem navItem={navItem} isArtist={isArtist} key={navItem.name} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
