/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { cn } from "../utils/cn";
import { useStateContext } from "../contexts";
// import { getMetadata } from "../utils/web3Helpers";
import { BackgroundGradientDemo } from "../components/BackgroundGradientDemo";
import { Gateway_url } from "../../config";
import AnimatedText from "../components/AnimatedDiv";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Link } from "react-router-dom";

const CreatorProfile = () => {
  const { ArtistsContract, account } = useStateContext();
  const [metadata, setMetadata] = useState([]);
  const address0 = "0x0000000000000000000000000000000000000000";
  const [creator, setCreator] = useState({
    name: "",
    wallet: "",
    artworks: [],
    reputation: 0,
  });
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      try {
        const { name, wallet, artworks, reputation } =
          await ArtistsContract.methods.getCreator(account).call();
        if (wallet === address0) throw new Error("Creator not registered");
        setIsRegistered(true);
        setCreator({
          name,
          wallet,
          artworks,
          reputation,
        });
      } catch (error) {
        console.error("Error fetching creator information:", error);
      }
    };

    if (ArtistsContract && account) {
      fetchCreatorInfo();
    }
  }, [ArtistsContract, account]);

  // Second useEffect: Fetch Artwork Data
  useEffect(() => {
    const fetchArtworkData = async () => {
      try {
        const metadataArray = [];

        for (let i = 0; i < creator.artworks.length; i++) {
          const { ipfsHash, value } = creator.artworks[i];
          const artworkDetails = {
            src: `${Gateway_url}/ipfs/${ipfsHash}`,
            value: value,
          };
          metadataArray.push(artworkDetails);
        }

        setMetadata(metadataArray);
      } catch (error) {
        console.error("Error fetching artwork data:", error);
      }
    };

    if (creator.artworks.length > 0) {
      fetchArtworkData();
    }
  }, [creator.artworks]);
  // console.log(metadata);

  const handleRegisterCreator = async (e) => {
    e.preventDefault();
    try {
      await ArtistsContract.methods
        .registerCreator(creator.name)
        .send({ from: account });
      setIsRegistered(true);
    } catch (err) {
      console.error(err);
      alert("Error in Registering");
    }
  };

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-auto bg-slate-950 w-full"
      )}
    >
      <div className="flex w-full items-center justify-evenly ">
        <div className="px-[10rem] py-[2rem] rounded-md mb- mr-0 flex justify-center items-center">
          <div className="mx-36">
            <AnimatedText>
              <div className="list-decimal text-slate-400 px-10 text-center">
                Creator Profile
              </div>
            </AnimatedText>
          </div>
          <div className="mx-36">
            <Link to={"/CreatorsRanking"}>
              <AnimatedText>
                <div className="list-decimal text-slate-400 px-10 text-center">
                  Creator Rankings
                </div>
              </AnimatedText>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="px-8 py-4 rounded-md h-[30rem] mr-24">
          <div className="mb-16">
            <AnimatedText>
              {isRegistered ? (
                <>
                  <div className="rounded-md mb-4 flex flex-col items-center ">
                    <div className="text-sm text-center text-slate-400 text-wrap">
                      <p>
                        <strong>Name:</strong> {creator.name}
                      </p>
                      <p>
                        <strong>Wallet:</strong> {creator.wallet}
                      </p>
                      <p>
                        <strong>Reputation:</strong>{" "}
                        {creator.reputation === 0n
                          ? 0
                          : creator.reputation.toString()}
                      </p>
                      <strong>Artworks Created:</strong>{" "}
                      {creator.artworks ? creator.artworks.length : 0}
                    </div>
                  </div>
                </>
              ) : (
                <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-slate-900 border border-slate-800">
                  <h2 className="font-bold text-xl text-slate-200">
                    Register as a Creator
                  </h2>
                  <p className="text-slate-400 text-sm max-w-sm mt-2">
                    Fill in the form to register as a creator.
                  </p>

                  <form className="my-8" onSubmit={handleRegisterCreator}>
                    <LabelInputContainer className="mb-4">
                      <Label htmlFor="name" className="text-slate-200">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={creator.name}
                        onChange={(e) =>
                          setCreator({ ...creator, name: e.target.value })
                        }
                        placeholder="Your Name"
                        type="text"
                        className="bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500"
                      />
                    </LabelInputContainer>
                    <button
                      className="bg-gradient-to-br relative group/btn from-cyan-900 to-blue-900 block w-full text-slate-200 rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#1e40af40_inset,0px_-1px_0px_0px_#1e40af40_inset]"
                      type="submit"
                    >
                      Register
                      <BottomGradient />
                    </button>
                  </form>
                </div>
              )}
            </AnimatedText>
          </div>
          <div className="mb-16 text-center">
            <Link to={"/allRequests"}>
              <AnimatedText>View Artist Requests</AnimatedText>
            </Link>
          </div>
        </div>
        <AnimatedText>
          <div className="flex flex-col items-center mt-4 w-[50rem] h-[35rem] overflow-y-scroll justify-evenly space-y-6 pt-8">
            {isRegistered ? (
              <>
                <h1 className="text-4xl text-slate-200">CREATED ARTWORKS</h1>
                <div className="flex items-center flex-wrap justify-around">
                  {metadata.map((item, index) => (
                    <div key={index}>
                      <BackgroundGradientDemo>
                        <img
                          src={item?.src}
                          className="h-52 w-52 mb-4 rounded-2xl "
                        />
                        <div className="text-sm text-center text-white-400">
                          <p>
                            <strong>Value:</strong> {Number(item.value)} MER
                          </p>
                        </div>
                      </BackgroundGradientDemo>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-slate-900 border border-slate-800 text-slate-200">
                PLEASE REGISTER
              </div>
            )}
          </div>
        </AnimatedText>
      </div>
    </div>
  );
};

export default CreatorProfile;

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};