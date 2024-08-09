// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ConstantProductERC1155Pricing.sol";
import "./Mercat.sol";

contract ArtistStorage {
    ConstantProductERC1155Pricing public marketplace;
    Mercat public merkatToken;

    struct Artist {
        string name;
        address wallet;
        string[] artCollection;
        string[] nftMarkets;
        uint[] myRequests;
        uint256 reputation;
    }

    struct Creator {
        string name;
        address wallet;
        ArtWork[] artworks;
        uint256 reputation;
    }

    struct ArtWork {
        string ipfsHash;
        uint256 value;
    }

    struct ArtRequest {
        uint256 id;
        string description;
        uint256 price;
        address artist;
        bool fulfilled;
    }

    struct ArtOption {
        string ipfsHash;
        address creator;
    }

    address[] public artistAddress;
    address[] public creatorsAddress;
    mapping(address => Artist) private artists;
    mapping(address => Creator) private creators;
    mapping(uint256 => ArtRequest) public artRequests;
    mapping(uint256 => ArtOption[]) public artOptions;
    mapping(uint256 => string) public fulfilledRequests;

    // mapping(address => Market[]) public artistMarkets;
    // mapping(address => string) public artistMarketsIpfs;

    uint256 public nextRequestId = 0;

    event ArtistRegistered(address indexed artistAddress, string name);
    event CreatorRegistered(address indexed creatorAddress, string name);
    event ArtRequestCreated(
        uint256 indexed requestId,
        address indexed artist,
        string description,
        uint256 price
    );
    event ArtOptionAdded(
        uint256 indexed requestId,
        address indexed creator,
        string ipfsHash
    );
    event RequestFulfilled(
        uint256 indexed requestId,
        address indexed artist,
        address indexed creator,
        string ipfsHash
    );

    constructor(address payable _marketplaceAddress,address _merkatAddress) {
        marketplace = ConstantProductERC1155Pricing(_marketplaceAddress);
        merkatToken= Mercat(_merkatAddress);
    }

    function addMarket(
        string memory ipfsHash,
        string memory name,
        string memory description,
        string memory theme,
        uint256 price,
        string memory perks
    ) public {
        require(artists[msg.sender].wallet != address(0), "Artist not registered");
        marketplace.initializeMarket(
            msg.sender,
            ipfsHash,
            name,
            description,
            theme,
            price,
            perks
        );
        artists[msg.sender].nftMarkets.push(ipfsHash);
    }

    function registerArtist(string memory _name) external {
        require(
            artists[msg.sender].wallet == address(0),
            "Artist already registered"
        );
        artists[msg.sender].name = _name;
        artists[msg.sender].wallet = msg.sender;
        artists[msg.sender].reputation = 0;
        // The artCollection array will be initialized as an empty storage array
        artistAddress.push(msg.sender);
        emit ArtistRegistered(msg.sender, _name);
    }

    function registerCreator(string memory _name) external {
        require(
            creators[msg.sender].wallet == address(0),
            "Creator already registered"
        );
        creators[msg.sender].name = _name;
        creators[msg.sender].wallet = msg.sender;
        creators[msg.sender].reputation = 0;
        // The artworks array will be initialized as an empty storage array
        creatorsAddress.push(msg.sender);
        emit CreatorRegistered(msg.sender, _name);
    }

    function createArtRequest(string memory _description, uint256 _price)
        external
    {
        require(
            artists[msg.sender].wallet != address(0),
            "Artist not registered"
        );
        uint256 requestId = nextRequestId++;
        artRequests[requestId] = ArtRequest(
            requestId,
            _description,
            _price,
            msg.sender,
            false
        );
        artists[msg.sender].myRequests.push(requestId);
        emit ArtRequestCreated(requestId, msg.sender, _description, _price);
    }

    function updateArtistReputation(address _artist) public {
        uint256 totalRevenue = 0;
        for (uint256 i = 0; i < artists[_artist].nftMarkets.length; i++) {
            string memory ipfs = artists[_artist].nftMarkets[i];
            ( , , , , , , uint price, , , uint amount) = marketplace.marketBalances(ipfs);
            totalRevenue += amount * price;
        }
        artists[_artist].reputation = sqrt(totalRevenue);
    }

    function updateCreatorReputation(address _creator) public {
        uint256 totalArtworkValue = 0;
        for (uint256 i = 0; i < creators[_creator].artworks.length; i++) {
            ArtWork storage artwork = creators[_creator].artworks[i];
            totalArtworkValue += artwork.value;
        }
        creators[_creator].reputation = sqrt(totalArtworkValue);
    }

    function addArtOption(uint256 _requestId, string memory _ipfsHash)
        external
    {
        require(
            creators[msg.sender].wallet != address(0),
            "Creator not registered"
        );
        require(
            !artRequests[_requestId].fulfilled,
            "Request already fulfilled"
        );
        artOptions[_requestId].push(ArtOption(_ipfsHash, msg.sender));
        emit ArtOptionAdded(_requestId, msg.sender, _ipfsHash);
    }

    function fulfillRequest(uint256 _requestId, uint256 _optionIndex) external {
        ArtRequest storage request = artRequests[_requestId];
        require(
            msg.sender == request.artist,
            "Only the artist can fulfill the request"
        );
        require(!request.fulfilled, "Request already fulfilled");
        require(
            _optionIndex < artOptions[_requestId].length,
            "Invalid option index"
        );

        ArtOption storage selectedOption = artOptions[_requestId][_optionIndex];
        // Mint the NFT to the artist's wallet
        merkatToken.burn(msg.sender,request.price);
        merkatToken.mint(selectedOption.creator,request.price);
        request.fulfilled = true;
        fulfilledRequests[_requestId] = selectedOption.ipfsHash;



        // Add the new NFT to the artist's collection
        artists[msg.sender].artCollection.push(selectedOption.ipfsHash);
        creators[selectedOption.creator].artworks.push(
            ArtWork(selectedOption.ipfsHash, request.price)
        );

        updateCreatorReputation(selectedOption.creator);


        emit RequestFulfilled(
            _requestId,
            msg.sender,
            selectedOption.creator,
            selectedOption.ipfsHash
        );
    }

    function getArtist(address _artist)
        external
        view
        returns (
            string memory name,
            address wallet,
            string[] memory artCollection,
            string[] memory nftMarkets,
            uint[] memory myRequests,
            uint256 reputation
        )
    {
        Artist storage artist = artists[_artist];
        return (
            artist.name,
            artist.wallet,
            artist.artCollection,
            artist.nftMarkets,
            artist.myRequests,
            artist.reputation
        );
    }

    function getCreator(address _creator)
        external
        view
        returns (
            string memory name,
            address wallet,
            ArtWork[] memory artworks,
            uint256 reputation
        )
    {
        Creator storage creator = creators[_creator];
        return (
            creator.name,
            creator.wallet,
            creator.artworks,
            creator.reputation
        );
    }

    function getArtOptions(uint256 _requestId)
        external
        view
        returns (ArtOption[] memory)
    {
        return artOptions[_requestId];
    }

    function getArtistAddresses() external view returns (address[] memory) {
        return artistAddress;
    }

    function getCreatorAddresses() external view returns (address[] memory) {
        return creatorsAddress;
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) {
            return 0;
        }

        uint256 y = x;
        uint256 i = 0;
        while (y > 1) {
            y >>= 2;
            i += 1;
        }

        uint256 z = 1 << i;
        return (z + x / z) >> 1;
    }
}