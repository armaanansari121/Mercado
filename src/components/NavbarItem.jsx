import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../utils/cn";

export function NavbarItem({ navItem }) {
  return (
    
    <NavLink
      to={navItem.link}
      className={cn(
        "relative dark:text-[#6fe7f7] items-center flex space-x-1 text-neutral-400 dark:hover:text-neutral-300 hover:text-[#6fe7f7]"
      )}
    >
      <span className="block sm:hidden ">{navItem.icon}</span>
      <span className="hidden sm:block text-sm ">{navItem.name}</span>
      {/* <span className="hidden sm:block text-sm ">{navItem.ConnectWallet}</span> */}
    </NavLink>
  );
}
