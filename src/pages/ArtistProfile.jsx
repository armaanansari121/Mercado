/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { cn } from "../utils/cn";
import { useStateContext } from "../contexts";
import { getMetadata } from "../utils/web3Helpers";
import { Gateway_url } from "../../config";
import AnimatedText from "../components/AnimatedDiv";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Link, useNavigate } from "react-router-dom";
import { BackgroundGradientDemo } from "../components/BackgroundGradientDemo";

const ArtistProfile = () => {
  const { ArtistsContract, ERC1155_CONTRACT, account } = useStateContext();
  const [metadata, setMetadata] = useState([]);
  const address0 = "0x0000000000000000000000000000000000000000";
  const [artist, setArtist] = useState({
    name: "",
    wallet: "",
    artCollection: [],
    nftMarkets: [],
    reputation: 0,
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [newArtRequest, setNewArtRequest] = useState({
    description: "",
    price: "",
  });
  const navigate = useNavigate();
  console.log(artist.reputation);

  useEffect(() => {
    const fetchArtistInfo = async () => {
      try {
        const { name, wallet, artCollection, nftMarkets, reputation } =
          await ArtistsContract.methods.getArtist(account).call();
        console.log(nftMarkets);
        if (wallet === address0) throw new Error("Artist not registered");
        setIsRegistered(true);
        setArtist({
          name,
          wallet,
          artCollection,
          nftMarkets,
          reputation,
        });
      } catch (error) {
        console.error("Error fetching artist information:", error);
      }
    };

    if (ArtistsContract && account) {
      fetchArtistInfo();
    }
  }, [ArtistsContract, account]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const metadataArray = [];

        for (let i = 0; i < artist.nftMarkets.length; i++) {
          const marketData = await ERC1155_CONTRACT.methods
            .marketBalances(artist.nftMarkets[i])
            .call();
          console.log(marketData);
          const { image } = await getMetadata(
            Gateway_url,
            artist.nftMarkets[i]
          );
          const price = marketData.price.toString();
          console.log(marketData.price);
          const nftDetails = {
            name: marketData.name,
            description: marketData.description,
            image,
            price,
            theme: marketData.theme,
            perks: marketData.perks,
          };
          metadataArray.push(nftDetails);
        }

        setMetadata(metadataArray);
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    if (ERC1155_CONTRACT && artist.nftMarkets.length > 0) {
      fetchMarketData();
    }
  }, [ERC1155_CONTRACT, artist.nftMarkets]);

  const handleRegisterArtist = async (e) => {
    e.preventDefault();
    try {
      await ArtistsContract.methods
        .registerArtist(artist.name)
        .send({ from: account });
      setIsRegistered(true);
    } catch (err) {
      console.error(err);
      alert("Error in Registering");
    }
  };

  const handleArtRequestCreate = async (e) => {
    e.preventDefault();
    try {
      await ArtistsContract.methods
        .createArtRequest(newArtRequest.description, newArtRequest.price)
        .send({ from: account });
      setNewArtRequest({ description: "", price: "" });
    } catch (err) {
      console.error(err);
      alert("Error creating art request");
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
          <div className="mx-40">
            <AnimatedText>
              <div className="list-decimal text-slate-400 px-10 text-center">
                Artist Profile
              </div>
            </AnimatedText>
          </div>
          <div className="mx-40">
            <Link to={"/ArtistsListing"}>
              <AnimatedText>
                <div className="list-decimal text-slate-400 px-10 text-center">
                  Artist Rankings
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
                        <strong>Name:</strong> {artist.name}
                      </p>
                      <p>
                        <strong>Wallet:</strong> {artist.wallet}
                      </p>
                      <p>
                        <strong>Reputation:</strong>{" "}
                        {artist.reputation === 0n
                          ? 0
                          : artist.reputation.toString()}
                      </p>
                      <strong>Markeplaces Owned:</strong>{" "}
                      {artist.nftMarkets ? artist.nftMarkets.length : 0}
                    </div>
                  </div>
                </>
              ) : (
                <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-slate-900 border border-slate-800">
                  <h2 className="font-bold text-xl text-slate-200">
                    Register as an Artist
                  </h2>
                  <p className="text-slate-400 text-sm max-w-sm mt-2">
                    Fill in the form to register as an artist.
                  </p>

                  <form className="my-8" onSubmit={handleRegisterArtist}>
                    <LabelInputContainer className="mb-4">
                      <Label htmlFor="name" className="text-slate-200">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={artist.name}
                        onChange={(e) =>
                          setArtist({ ...artist, name: e.target.value })
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
          {!isRegistered ? (
            <div>
              <h1 className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-slate-900 border border-slate-800">
                Please Register
              </h1>
            </div>
          ) : (
            <AnimatedText>
              <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-slate-900 border border-slate-800">
                <button
                  className="bg-gradient-to-br mb-4 relative group/btn from-cyan-900 to-blue-900 block w-full text-slate-200 rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#1e40af40_inset,0px_-1px_0px_0px_#1e40af40_inset] "
                  onClick={() => navigate("/myRequests")}
                >
                  View My Requests
                  <BottomGradient />
                </button>
                <h2 className="font-bold text-xl text-slate-200">
                  Create Art Request
                </h2>
                <p className="text-slate-400 text-sm max-w-sm mt-2">
                  Fill in the form to create an art request.
                </p>

                <form className="my-8" onSubmit={handleArtRequestCreate}>
                  <LabelInputContainer className="mb-4">
                    <Label htmlFor="description" className="text-slate-200">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={newArtRequest.description}
                      onChange={(e) =>
                        setNewArtRequest({
                          ...newArtRequest,
                          description: e.target.value,
                        })
                      }
                      placeholder="Request Description"
                      type="text"
                      className="bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500"
                    />
                  </LabelInputContainer>
                  <LabelInputContainer className="mb-4">
                    <Label htmlFor="price" className="text-slate-200">
                      Price (MER)
                    </Label>
                    <Input
                      id="price"
                      value={newArtRequest.price}
                      onChange={(e) =>
                        setNewArtRequest({
                          ...newArtRequest,
                          price: e.target.value,
                        })
                      }
                      placeholder="Request Price"
                      type="number"
                      className="bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500"
                    />
                  </LabelInputContainer>
                  <button
                    className="bg-gradient-to-br relative group/btn from-cyan-900 to-blue-900 block w-full text-slate-200 rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#1e40af40_inset,0px_-1px_0px_0px_#1e40af40_inset]"
                    type="submit"
                  >
                    Create Request
                    <BottomGradient />
                  </button>
                </form>
              </div>
            </AnimatedText>
          )}
        </div>
        <AnimatedText>
          <div className="flex flex-col items-center mt-4 w-[50rem] h-[35rem] overflow-y-scroll justify-evenly space-y-6 pt-8">
            {isRegistered ? (
              <>
                <h1 className="text-4xl text-slate-200">OWNED NFTs</h1>
                <div className="flex items-center flex-wrap justify-around">
                  {metadata.map((item, index) => (
                    <div key={index}>
                      <BackgroundGradientDemo>
                        <img
                          src={item?.image}
                          alt={item?.name}
                          className="h-52 w-52 mb-4 rounded-2xl "
                        />
                        <div className="text-sm text-center text-white-400">
                          <p>
                            <strong>Name:</strong> {item.name}
                          </p>
                          <p>
                            <strong>Description:</strong> {item.description}
                          </p>
                          <p>
                            <strong>Theme:</strong> {item.theme}
                          </p>
                          <p>
                            <strong>Perks:</strong> {item.perks}
                          </p>
                          <p>
                            <strong>Price:</strong> {item.price} MER
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

export default ArtistProfile;

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