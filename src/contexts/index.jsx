import React, { useContext, createContext, useState } from "react";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [ERC1155_CONTRACT, setERC1155_CONTRACT] = useState(null);
  const [MercatContract, setMercatContract] = useState(null);
  const [ArtistsContract, setArtistsContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [priceData, setPriceData] = useState([]);

  return (
    <StateContext.Provider
      value={{
        ERC1155_CONTRACT,
        setERC1155_CONTRACT,
        MercatContract,
        setMercatContract,
        ArtistsContract,
        setArtistsContract,
        account,
        setAccount,
        priceData,
        setPriceData,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
