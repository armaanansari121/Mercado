/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import NFTPriceChart from './Chart';
import { useStateContext } from '../contexts';

export const DisplayChart = ({ ipfsHash }) => {
 
  const { ERC1155_CONTRACT } = useStateContext();

  if (!ERC1155_CONTRACT) {
    return <div>Loading contract...</div>;
  }

  return (
    <div>
      <h2>NFT Price Chart</h2>
      <NFTPriceChart ERC1155_CONTRACT={ERC1155_CONTRACT} ipfsHash={ipfsHash} />
    </div>
  );
};