import React, { useState, useEffect } from "react";
import FileUpload from "../../components/FileUpload";
import { Gateway_url } from "../../../config";
import { useStateContext } from "../../contexts";
import { motion } from "framer-motion";
import { getMetadata } from "../../utils/web3Helpers";

function CreateNFT() {
  const { ERC1155_CONTRACT, account,ArtistsContract } = useStateContext();

  const [loading, setLoading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [metadataHash, setMetadataHash] = useState("");
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [metadata, setMetadata] = useState({});
  const [metadataFields, setMetadataFields] = useState({
    name: "",
    description: "",
    theme: "",
    price: "", // New field for NFT price
    // array of string for perks
    perks: "",
  });

  const handleMintNFT = async () => {
    if (metadataHash && account) {
      setLoading(true);
      try {
        await ArtistsContract.methods.
        addMarket( metadataHash,metadataFields.name,metadataFields.description,metadataFields.theme,metadataFields.price,metadataFields.perks)
          .send({ from: account });
        setLoading(false);
        alert("NFTs Created successfully!");
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (metadataHash) {
      getMetadata(Gateway_url, metadataHash)
        .then((data) => setMetadata(data))
        .catch((error) => setError(error.message));
    }
  }, [metadataHash]);

  return (
    <div className="abc bg-gray-900 min-h-screen flex items-center justify-center">
      <div
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 min-h-[650px] flex flex-col relative overflow-hidden"
        style={{
          width: "80%",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
          boxShadow: "0 4px 12px rgba(255, 255, 255, 0.1)",
        }}
      >
        <h1 className="text-5xl font-bold text-[#ffffff] mb-4">Create NFT</h1>
        <div className="ParDiv grid grid-cols-2 gap-16 mt-4 h-[500px]">
          <div className="Tobeonleft">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <FileUpload
              ipfsHash={ipfsHash}
              account={account}
              setIpfsHash={setIpfsHash}
              metadataHash={metadataHash}
              setMetadataHash={setMetadataHash}
              setPreviewImage={setPreviewImage}
              metadataFields={metadataFields}
              setMetadataFields={setMetadataFields}
            />
            {metadataHash && (
              <>
                
                <motion.button
                  whileHover={{
                    boxShadow: "0 0 10px 3px rgba(255, 255, 255, 0.7)",
                  }}
                  onClick={handleMintNFT}
                  className="block my-4 p-2 text-white rounded-2xl"
                  style={{ backgroundColor: "#0000008f" }}
                  disabled={!metadataHash || !account}
                >
                  {loading ? "Creating NFT..." : "Create NFT"}
                </motion.button>
              </>
            )}
          </div>
          {!loading?<div className="ToBeOnTheRight bg-zinc-800 h-[450px] rounded-3xl flex items-center justify-center">
            {previewImage  && (
              <img src={previewImage} alt="Preview" className="max-w-full max-h-full" />
            )}
          </div>:
        //   <Loader />
          <div className="text-slate-100 flex justify-center items-center">
          <div
            className="inline-block h-32 w-32 animate-spin rounded-full border-8 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          ></div>
          {/* <span className="text-2xl">Loading...</span> */}
        </div>
          }
        </div>
        
      </div>
      
    </div>
  );
}

export default CreateNFT;
