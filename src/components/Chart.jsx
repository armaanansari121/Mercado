import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useStateContext } from '../contexts';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const NFTPriceChart = ({ contract, ipfsHash }) => {
  
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    const fetchPriceData = async () => {
      // Fetch initial price
      const initialPrice = await contract.getNFTPrice(ipfsHash);
      setPriceData([{ time: new Date(), price: initialPrice.toNumber() }]);

      // Set up interval to fetch price every 30 seconds
      const interval = setInterval(async () => {
        const currentPrice = await contract.getNFTPrice(ipfsHash);
        setPriceData(prevData => [...prevData, { time: new Date(), price: currentPrice.toNumber() }]);
      }, 30000);

      return () => clearInterval(interval);
    };

    fetchPriceData();
  }, [contract, ipfsHash]);

  const chartData = {
    labels: priceData.map(data => data.time.toLocaleTimeString()),
    datasets: [
      {
        label: 'NFT Price',
        data: priceData.map(data => data.price),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
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
        text: 'NFT Price Over Time',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (MERCAT)',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default NFTPriceChart;




// import NFTPriceChart from './NFTPriceChart';

// function App() {
//   // Assume you have the contract instance and IPFS hash
//   const contract = /* Your contract instance */;
//   const ipfsHash = "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

//   return (
//     <div>
//       <h1>NFT Price Chart</h1>
//       <NFTPriceChart contract={contract} ipfsHash={ipfsHash} />
//     </div>
//   );
// }