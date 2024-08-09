// MyRequests.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts";
import AnimatedText from "../components/AnimatedDiv";
import { cn } from "../utils/cn";
import { getMetadata } from "../utils/web3Helpers";
import { Gateway_url } from "../../config";

const MyRequests = () => {
  const { ArtistsContract, account } = useStateContext();
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const artistData = await ArtistsContract.methods
          .getArtist(account)
          .call();
        const requestIds = artistData.myRequests;
        const requestsData = await Promise.all(
          requestIds.map(async (id) => {
            const request = await ArtistsContract.methods
              .artRequests(id)
              .call();
            let fulfilledIpfsHash = null;
            let src = null;

            if (request.fulfilled) {
              fulfilledIpfsHash = await ArtistsContract.methods
                .fulfilledRequests(id)
                .call();
              if (fulfilledIpfsHash) {
                src = `${Gateway_url}/ipfs/${fulfilledIpfsHash}`;
              }
            }

            return {
              ...request,
              fulfilledIpfsHash,
              src,
            };
          })
        );
        console.log(requestsData);
        setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    if (ArtistsContract && account) {
      fetchRequests();
    }
  }, [ArtistsContract, account]);

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-auto bg-slate-950 w-full"
      )}
    >
      <AnimatedText>
        <h1 className="text-4xl text-slate-200 mb-8">My Requests</h1>
        <div className="w-[50rem] h-[35rem] overflow-y-scroll space-y-6">
          {requests.map((request, index) => (
            <div
              key={index}
              className="bg-slate-900 rounded-md p-4 border border-slate-700"
            >
              <p className="text-slate-200">
                <strong>ID:</strong> {Number(request.id)}
              </p>
              <p className="text-slate-200">
                <strong>Description:</strong> {request.description}
              </p>
              <p className="text-slate-200">
                <strong>Price:</strong> {Number(request.price)} MER
              </p>
              <p className="text-slate-200">
                <strong>Fulfilled:</strong> {request.fulfilled ? "Yes" : "No"}
              </p>
              {request.fulfilled ? (
                <img
                  src={request.src}
                  alt="Fulfilled Request"
                  className="w-full h-40 object-contain rounded-md mt-2"
                />
              ) : (
                <button
                  className="bg-gradient-to-br relative group/btn from-cyan-900 to-blue-900 block w-full text-slate-200 rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#1e40af40_inset,0px_-1px_0px_0px_#1e40af40_inset] mt-4"
                  onClick={() => navigate(`/viewOptions/${request.id}`)}
                >
                  View Options
                </button>
              )}
            </div>
          ))}
        </div>
      </AnimatedText>
    </div>
  );
};

export default MyRequests;
