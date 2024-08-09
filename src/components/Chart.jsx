/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
// ChartSetup.js
import './ChartSetup'; // Ensure this is imported
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { useStateContext } from '../contexts';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const NFTPriceChart = ({ ipfsHash, ERC1155_CONTRACT }) => {
  const {priceData, setPriceData} = useStateContext();
  console.log("priceData",priceData);

  // useEffect(() => {
  //   const fetchPriceData = async () => {
  //     if (!ERC1155_CONTRACT) {
  //       console.error("ERC1155_CONTRACT is not initialized");
  //       return;
  //     }
  //     try {
  //       const price = await ERC1155_CONTRACT.methods.getNFTPrice(ipfsHash).call();
  //       setPriceData(prevData => [...prevData, Number(price)]);
  //     } catch (error) {
  //       console.error("Error fetching price data:", error);
  //     }
  //   };

  //   fetchPriceData();
  //   const interval = setInterval(fetchPriceData, 60000);

  //   return () => clearInterval(interval);
  // }, [ipfsHash, ERC1155_CONTRACT]);

  const data = {
    labels: priceData.map((_, index) => `Point ${index + 1}`),
    
    datasets: [
      {
        label: 'NFT Price',
        data: priceData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'NFT Price Chart',
      },
    },
  };

  return <Line options={options} data={data} />;
};

export default NFTPriceChart;