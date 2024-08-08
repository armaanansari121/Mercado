import axios from 'axios';

// export const getMetadata = async (Gateway_url,metadataHash) => {
//     try {
//         const res = await axios.get(`${Gateway_url}/ipfs/${metadataHash}`);
//         return res.data;
//     } catch (error) {
//         console.log(error);
//     }
// };
// utils/web3Helpers.js

export async function getMetadata(baseUrl, metadataHash) {
    try {
      const response = await fetch(`${baseUrl}/ipfs/${metadataHash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  }
  