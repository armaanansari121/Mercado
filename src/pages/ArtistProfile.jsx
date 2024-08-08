/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { cn } from "../utils/cn";
import { useStateContext } from "../contexts";
import { getMetadata } from "../utils/web3Helpers";
import { Gateway_url } from "../../config";
import AnimatedText from "../components/AnimatedDiv";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const ArtistProfile = () => {
  const { ArtistsContract, ERC1155_CONTRACT, account } = useStateContext();
  const [metadata, setMetadata] = useState([]);
  // const [profileImage, setProfileImage] = useState(null);
  const [artist, setArtist] = useState({
    name: "",
    wallet: "",
    artCollection: [],
    nftMarkets: [],
    reputation: 0,
  });
  const [isRegistered, setIsRegistered] = useState(false);
  console.log(account);
  useEffect(() => {
    const fetchArtistInfo = async () => {
      try {
        const { name, wallet, artCollection, nftMarkets, reputation } =
          await ArtistsContract.methods.getArtist(account).call();
        setArtist({
          name,
          wallet,
          artCollection,
          nftMarkets,
          reputation,
        });
        setIsRegistered(true);
      } catch (error) {
        console.error("Error fetching artist information:", error);
      }
    };

    const fetchMarketData = async () => {
      try {
        const metadataArray = [];

        for (let i = 0; i < artist.nftMarkets.length; i++) {
          const marketData = await ERC1155_CONTRACT.methods
            .marketBalances(artist.nftMarkets[i])
            .call();
          const data = await getMetadata(Gateway_url, artist.nftMarkets[i]);
          const nftDetails = {
            name: data.name,
            description: data.description,
            price: data.price,
            image: data.image,
            creator: data.creator,
            available: marketData[9],
          };
          metadataArray.push(nftDetails);
        }

        setMetadata(metadataArray);
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    if (ArtistsContract && ERC1155_CONTRACT && account) {
      fetchArtistInfo();
      fetchMarketData();
    }
  }, [ArtistsContract, ERC1155_CONTRACT, account, artist.nftMarkets]);

  // const handleImageChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setProfileImage(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };
  // console.log(ArtistsContract);
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

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full"
      )}
    >
      {/* <div className="justify-center items-center mt-[8rem] text-slate-400 text-8xl">
        ARTIST
      </div> */}

      <div className="flex items-center mt-[4rem]">
        {/* <div className="w-[20rem] h-[20rem] border-2 bg-white rounded-full mr-[60px] translate-x-[8rem] translate-y-[1rem]">
          {profileImage ? (
            <img
              src={profileImage}
              className="w-full h-full rounded-full object-cover"
              alt="Profile"
            />
          ) : (
            <div className="flex mt-[9rem] ml-[4rem]">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          )}
        </div> */}

        <div className="px-[10rem] py-[2rem] rounded-md mb- mr-0">
          <AnimatedText>
            <div className="list-decimal text-slate-400 px-10 text-center">
              Artist Profile
            </div>
          </AnimatedText>
        </div>
      </div>

      <div className="flex">
        <div className="px-8 py-4 rounded-md w-[25rem] h-[30rem] mr-24">
          <AnimatedText>
            {isRegistered ? (
              <>
                <div className="rounded-md  mb-4 flex flex-col items-center ">
                  {/* <img
                src={profileImage || "/placeholder.jpg"}
                className="h-52 w-52 mb-4 rounded "
                alt={artist.name}
              /> */}
                  <div className="text-[12px] text-center text-slate-400">
                    <p>
                      <strong>Name:</strong> {artist.name}
                    </p>
                    <p>
                      <strong>Wallet:</strong> {artist.wallet}
                    </p>
                    <p>
                      <strong>Reputation:</strong>{" "}
                      {artist.reputation === 0n ? 0 : artist.reputation}
                    </p>
                    <strong>Markeplaces Owned:</strong>{" "}
                    {artist.nftMarkets ? artist.nftMarkets.length : 0}
                  </div>
                </div>
              </>
            ) : (
              <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
                <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                  Register as an Artist
                </h2>
                <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                  Fill in the form to register as an artist.
                </p>

                <form className="my-8" onSubmit={handleRegisterArtist}>
                  <LabelInputContainer className="mb-4">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={artist.name}
                      onChange={(e) =>
                        setArtist({ ...artist, name: e.target.value })
                      }
                      placeholder="Your Name"
                      type="text"
                    />
                  </LabelInputContainer>
                  <button
                    className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
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
        <AnimatedText>
          <div className="flex items-center mt-4 w-[50rem] h-[35rem] overflow-y-scroll flex-between flex-wrap justify-evenly space-y-6 pt-8">
            {isRegistered ? (
              <>
                {metadata.map((item, index) => (
                  <div
                    key={index}
                    className=" rounded-md w-72 h-80 mb-4 flex flex-col items-center "
                  >
                    <img
                      src={item.image}
                      className="h-52 w-52 mb-4 rounded "
                      alt={item.name}
                    />
                    <div className="text-[12px] text-center text-slate-400">
                      <p>
                        <strong>Name:</strong> {item.name}
                      </p>
                      <p>
                        <strong>Description:</strong> {item.description}
                      </p>
                      <p>
                        <strong>Available:</strong> {item.available}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input dark:bg-black">
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
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
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
