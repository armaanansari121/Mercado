// AllRequests.jsx
import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts";
import AnimatedText from "../components/AnimatedDiv";
import { cn } from "../utils/cn";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import FileUploadForArtRequests from "../components/FileUploadForArtRequests";

const AllRequests = () => {
  const { ArtistsContract, account } = useStateContext();
  const [requests, setRequests] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const [optionInputs, setOptionInputs] = useState({});
  // const navigate = useNavigate();

  useEffect(() => {
    const checkCreatorStatus = async () => {
      try {
        const creator = await ArtistsContract.methods
          .getCreator(account)
          .call();
        setIsCreator(
          creator.wallet !== "0x0000000000000000000000000000000000000000"
        );
        if (isCreator) {
          setCreatorName(creator.name);
        }
      } catch (error) {
        console.error("Error checking creator status:", error);
      }
    };

    const fetchUnfulfilledRequests = async () => {
      try {
        const requestCount = await ArtistsContract.methods
          .nextRequestId()
          .call();
        const unfulfilledRequests = [];
        for (let i = 0; i < requestCount; i++) {
          const request = await ArtistsContract.methods.artRequests(i).call();
          if (!request.fulfilled) {
            unfulfilledRequests.push(request);
          }
        }
        setRequests(unfulfilledRequests);
        setOptionInputs(
          Object.fromEntries(unfulfilledRequests.map((req) => [req.id, ""]))
        );
      } catch (error) {
        console.error("Error fetching unfulfilled requests:", error);
      }
    };

    if (ArtistsContract && account) {
      checkCreatorStatus();
      if (isCreator) {
        fetchUnfulfilledRequests();
      }
    }
  }, [ArtistsContract, account, isCreator]);

  const handleRegisterCreator = async (e) => {
    e.preventDefault();
    try {
      await ArtistsContract.methods
        .registerCreator(creatorName)
        .send({ from: account });
      setIsCreator(true);
    } catch (error) {
      console.error("Error registering creator:", error);
    }
  };

  const handleSubmitOption = async (requestId, ipfsHash) => {
    try {
      await ArtistsContract.methods
        .addArtOption(requestId, ipfsHash)
        .send({ from: account });
      alert("Option submitted successfully!");
      // Optionally, you can refresh the requests list here
    } catch (error) {
      console.error("Error submitting option:", error);
      alert("Error submitting option. Please try again.");
    }
  };

  const handleHashGenerated = (requestId, hash) => {
    setOptionInputs({ ...optionInputs, [requestId]: hash });
  };

  if (!isCreator) {
    return (
      <div
        className={cn(
          "relative flex min-h-screen flex-col items-center justify-center overflow-auto bg-slate-950 w-full"
        )}
      >
        <AnimatedText>
          <h1 className="text-4xl text-slate-200 mb-8">Register as Creator</h1>
          <form onSubmit={handleRegisterCreator} className="w-96">
            <Label htmlFor="creatorName" className="text-slate-200">
              Creator Name
            </Label>
            <Input
              id="creatorName"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="mb-4"
              placeholder="Enter your creator name"
            />
            <button
              type="submit"
              className="bg-gradient-to-br relative group/btn from-cyan-900 to-blue-900 block w-full text-slate-200 rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#1e40af40_inset,0px_-1px_0px_0px_#1e40af40_inset]"
            >
              Register as Creator
            </button>
          </form>
        </AnimatedText>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-auto bg-slate-950 w-full"
      )}
    >
      <AnimatedText>
        <h1 className="text-4xl text-slate-200 mb-8">Unfulfilled Requests</h1>
        <div className="w-[50rem] h-[35rem] overflow-y-scroll space-y-6">
          {requests.map((request) => (
            <div
              key={request.id}
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
                <strong>Artist:</strong> {request.artist}
              </p>
              <div className="mt-4">
                <Label
                  htmlFor={`option-${request.id}`}
                  className="text-slate-200"
                >
                  Submit Art Option
                </Label>
                <FileUploadForArtRequests
                  requestId={request.id}
                  onSubmitOption={handleSubmitOption}
                />
              </div>
            </div>
          ))}
        </div>
      </AnimatedText>
    </div>
  );
};

export default AllRequests;
