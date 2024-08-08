import React from "react";
import { ConnectButton } from "thirdweb/react";
import { client } from "../App";

const ConnectWalletButton = () => {
  return (
    <div className="fixed z-[5000] top-6 right-4">
    <ConnectButton 
      client={client}
      theme="dark"
      connectModal={{
        title: "Sign In with your wallet",
        description: "Sign In with your wallet",
      }}
      

      
    />
    </div>
  );
};

export default ConnectWalletButton;
