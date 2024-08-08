import React, { useContext, createContext, useState } from "react";
import Web3 from "web3";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [ERC1155_CONTRACT, setERC1155_CONTRACT] = useState(null);
  const [MercatContract, setMercatContract] = useState(null);
  const [account, setAccount] = useState(null);
  // const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  console.log(ERC1155_CONTRACT);
  console.log(MercatContract);

  return (
    <StateContext.Provider
      value={{
        ERC1155_CONTRACT,
        setERC1155_CONTRACT,
        MercatContract,
        setMercatContract,
        account,
        setAccount,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
