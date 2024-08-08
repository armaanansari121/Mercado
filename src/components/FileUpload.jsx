import React, { useState, useEffect } from "react";
import { JWT_SECRET_ACCESS_TOKEN, Gateway_url } from "../../config";
import { motion } from "framer-motion";

function FileUpload({
  ipfsHash,
  setIpfsHash,
  metadataHash,
  setMetadataHash,
  setPreviewImage,
  account,
  handleLoadingChange,
  metadataFields,
  setMetadataFields
}) {
  const [selectedFile, setSelectedFile] = useState();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingMetadata, setUploadingMetadata] = useState(false);
  

  useEffect(() => {
    if (ipfsHash) {
      setPreviewImage(`${Gateway_url}/ipfs/${ipfsHash}`);
    }
  }, [ipfsHash, setPreviewImage]);

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    if (event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleSubmission = async () => {
    try {
      setUploadingFile(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${JWT_SECRET_ACCESS_TOKEN}`,
          },
          body: formData,
        }
      );
      const resData = await res.json();
      setIpfsHash(resData.IpfsHash);

      setPreviewImage(`${Gateway_url}/ipfs/${resData.IpfsHash}`);

      setUploadingFile(false);

      handleLoadingChange(true); // Indicate that metadata upload is starting
    } catch (error) {
      console.log("Error uploading file to IPFS:", error);
      setUploadingFile(false);
    }
  };

  const handleMetadata = async () => {
    try {
      setUploadingMetadata(true);

      const metadataObject = {
        name: metadataFields.name,
        description: metadataFields.description,
        theme: metadataFields.theme,
        creator: account,
        image: `${Gateway_url}/ipfs/${ipfsHash}`,
        price: metadataFields.price, // Include price in metadata
        Perks: metadataFields.perks, // Include perks in metadata
      };
      const metadata = JSON.stringify(metadataObject);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${JWT_SECRET_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: metadata,
        }
      );
      const resData = await res.json();
      setMetadataHash(resData.IpfsHash);

      setUploadingMetadata(false);

      handleLoadingChange(false); // Indicate that metadata upload is complete
    } catch (error) {
      console.log("Error uploading metadata to IPFS:", error);
      setUploadingMetadata(false);
    }
  };

  useEffect(() => {
    if (ipfsHash) {
      handleMetadata();
    }
  }, [ipfsHash]);

  const handleInputChange = (field, value) => {
    setMetadataFields((prevFields) => ({
      ...prevFields,
      [field]: value,
    }));
    
  };

  return (
    <>
      <label className="form-label">Choose File :</label>
      <input
        type="file"
        onChange={changeHandler}
        className="file-upload-button"
        style={{ boxShadow: "0 0 6px 2px rgba(255, 255, 255, 0.7)" }}
      />
      {uploadingFile && (
        <div className="text-slate-100">
          <div
            className="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            {/* Loading animation */}
          </div>
          <span>Uploading</span>
        </div>
      )}
      {uploadingMetadata && (
        <div className="text-slate-100">
          <div
            className="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            {/* Loading animation */}
          </div>
          <span>Uploading Metadata</span>
        </div>
      )}

      {!metadataHash && (
        <>
          <input
            type="text"
            placeholder="Name"
            className="my-3"
            style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px", padding: "8px", width:"100%"}}
            value={metadataFields.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="my-3"
            style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px", padding: "8px", width:"100%"}}
            value={metadataFields.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
          <select
            value={metadataFields.theme}
            style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px", padding: "8px", width:"100%"}}
            onChange={(e) => handleInputChange("theme", e.target.value)}
          >
            <option value="">Select Theme</option>
            <option value="Gaming">Gaming</option>
            <option value="Arts">Arts</option>
            <option value="Music">Music</option>
          </select>
          <input
            type="text"
            placeholder="Price (in MEC)"
            className="my-3"
            style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px", padding: "8px", width:"100%"}}
            value={metadataFields.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
          />
          <input
            type="text"
            placeholder="Perks (comma separated) e.g. 'VIP Access, Early Access'"
            className="my-3"
            style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px", padding: "8px", width:"100%"}}
            value={metadataFields.perks}
            onChange={(e) => handleInputChange("perks", e.target.value)}
          />

          <motion.button
            whileHover={{ boxShadow: "0 0 10px 3px rgba(255, 255, 255, 0.7)" }}
            onClick={handleSubmission}
            className="block my-4 p-2 text-white rounded-2xl"
            style={{ backgroundColor: "#0000008f" }}
          >
            Submit  
          </motion.button>
        </>
      )}
    </>
  );
}

export default FileUpload;
