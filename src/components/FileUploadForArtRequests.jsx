/* eslint-disable react/prop-types */
import { useState } from "react";
import { JWT_SECRET_ACCESS_TOKEN } from "../../config";

function FileUploadForArtRequests({ requestId, onSubmitOption }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmission = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    try {
      setProcessing(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      // Upload file to IPFS
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
      const ipfsHash = resData.IpfsHash;

      // Call the contract function to add the art option
      await onSubmitOption(requestId, ipfsHash);

      setProcessing(false);
      setSelectedFile(null);
      alert("Art option submitted successfully!");
    } catch (error) {
      console.error("Error uploading file or submitting option:", error);
      setProcessing(false);
      alert("Error processing request. Please try again.");
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={changeHandler}
        className="file-upload-button mb-2"
        style={{ boxShadow: "0 0 6px 2px rgba(255, 255, 255, 0.7)" }}
      />
      <button
        onClick={handleSubmission}
        disabled={processing}
        className="bg-gradient-to-br relative group/btn from-cyan-900 to-blue-900 block w-full text-slate-200 rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#1e40af40_inset,0px_-1px_0px_0px_#1e40af40_inset]"
      >
        {processing ? "Processing..." : "Upload & Submit Option"}
      </button>
    </div>
  );
}

export default FileUploadForArtRequests;
