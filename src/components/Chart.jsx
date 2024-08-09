import React, { useEffect, useState } from 'react';
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

const NFTPriceChart = ({ contract, ipfsHash }) => {
  const { ERC1155_CONTRACT } = useStateContext();
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    const fetchPriceData = async () => {
      if (!ERC1155_CONTRACT) {
        console.error("ERC1155_CONTRACT is not initialized");
        return;
      }
      
      if (typeof ipfsHash !== 'string' || !ipfsHash) {

        console.error("Invalid ipfsHash:", ipfsHash);
        return;
      }

      try {
        console.log("ERC1155_CONTRACT:", ERC1155_CONTRACT);
        const price = await ERC1155_CONTRACT.methods.priceHistory(ipfsHash).call();
        console.log("Price data:", price);

        // Assuming the contract returns an array of prices in BigInt or other formats
        setPriceData(price.map(p => Number(p))); // Convert to Number if necessary
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 60000);

    return () => clearInterval(interval);
  }, [ipfsHash, ERC1155_CONTRACT]);

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
