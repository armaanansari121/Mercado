// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./Mercat.sol";
import "./Artists.sol";

contract ConstantProductERC1155Pricing is
    ERC1155,
    Ownable,
    ReentrancyGuard,
    Pausable
{
    Mercat public mercatToken;

    uint256 private constant SCALE = 1e6;

    struct Market {
        uint256 mercatBalance;
        uint256 nftBalance;
        // Add any additional fields as needed

        string name;
        string description;
        string theme;
        string image; // IPFS hash for the image of the NFT marketplace
        uint256 price;
        string perks;
        address artist;
        //Managing count of NFts in circulation
        uint256 countNFTs;
    }

    // Global token ID counter
    uint256 public nextTokenId = 1;

    // Mapping from IPFS hash to Market
    mapping(string => Market) public marketBalances;
    mapping(string => bool) public marketInitialized;
    // mapping(address=> mapping (uint => Market)) public marketOwner;
    mapping(string => uint256[]) public priceHistory;

    // Mapping from token ID to IPFS hash
    mapping(uint256 => string) public tokenIdToIpfsHash;

    uint256 public ownerFees;
    uint256 public ethReserve;

    uint256 public feePercentage = 15;
    uint256 public ownerFeePercentage = 7;
    uint256 public marketFeePercentage = 8;

    uint256 public constant ETH_TO_MERCAT_RATE = 100000; // 1 ETH = 100000 MERCAT

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 price,
        uint256 fee
    );
    event NFTSold(
        address indexed from,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 price,
        uint256 fee
    );
    event FeesUpdated(
        uint256 newFeePercentage,
        uint256 newOwnerFeePercentage,
        uint256 newMarketFeePercentage
    );
    event MaxPriceImpactUpdated(uint256 newMaxPriceImpact);
    event ETHToMERCATConverted(
        address indexed user,
        uint256 ethAmount,
        uint256 mercatAmount
    );
    event MERCATToETHConverted(
        address indexed user,
        uint256 mercatAmount,
        uint256 ethAmount
    );
    event MarketInitialized(string ipfsHash, uint256 tokenId);

    constructor(address _mercatTokenAddress, string memory _baseUri)
        ERC1155(_baseUri)
        Ownable(msg.sender)
    {
        mercatToken = Mercat(_mercatTokenAddress);
    }

    function initializeMarket(
        address artist,
        string memory ipfsHash,
        string memory name,
        string memory description,
        string memory theme,
        uint256 price,
        string memory perks
    ) public {
        require(!marketInitialized[ipfsHash], "Market already initialized");
        marketBalances[ipfsHash] = Market(
            1,
            1,
            name,
            description,
            theme,
            ipfsHash,
            price,
            perks,
            artist,
            1
        );
        marketInitialized[ipfsHash] = true;

        priceHistory[ipfsHash].push(price);

        // marketOwner[msg.sender].push(marketBalances[ipfsHash]);
        mercatToken.burn(artist, 150 * 10**18);
        // Associate the new token ID with the IPFS hash
        tokenIdToIpfsHash[nextTokenId] = ipfsHash;
        emit MarketInitialized(ipfsHash, nextTokenId);
        nextTokenId++;
    }

    function setFees(uint256 _feePercentage, uint256 _ownerFeePercentage)
        external
        onlyOwner
    {
        require(
            _feePercentage >= _ownerFeePercentage,
            "Owner fee cannot exceed total fee"
        );
        feePercentage = _feePercentage;
        ownerFeePercentage = _ownerFeePercentage;
        marketFeePercentage = _feePercentage - _ownerFeePercentage;
        emit FeesUpdated(
            feePercentage,
            ownerFeePercentage,
            marketFeePercentage
        );
    }

    function mint(
        ArtistStorage artistStorage,
        string memory ipfsHash,
        uint256 amount
    ) public nonReentrant whenNotPaused {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage market = marketBalances[ipfsHash];

        uint256 kn = getK(ipfsHash);
        if (kn == 1) {
            kn = kn * (10**6);
        }
        market.nftBalance += amount;
        market.mercatBalance = (kn / (market.nftBalance));
        uint256 basePrice = (market.price) * (10**6) + market.mercatBalance;
        uint256 fee = (basePrice * feePercentage) / (100);
        uint256 totalPrice = (basePrice) + (fee);
        market.price = (totalPrice) / (10**6);

        mercatToken.burn(msg.sender,amount * totalPrice * (10**12));
        // require(mercatToken.balanceOf(msg.sender) >= totalPrice,"you do not have enough Mercat" );
        uint256 ownerFee = ((fee * ownerFeePercentage) / 100);
        uint256 marketFee = fee - ownerFee;
        uint256 artistFee = marketFee/2;
        mercatToken.mint(market.artist,artistFee*10**12); //yha 10*18 to nhi hoga i guess maybe 12
        market.mercatBalance += (marketFee/2);
        ownerFees += (ownerFee / (10**6));

        // Find the token ID associated with this IPFS hash
        uint256 tokenId = getTokenIdFromIpfsHash(ipfsHash);
        _mint(msg.sender, tokenId, amount, "");
        market.countNFTs = market.countNFTs + amount;

        artistStorage.updateArtistReputation(market.artist);
        emit NFTMinted(msg.sender, tokenId, amount, market.price, fee);
        priceHistory[ipfsHash].push(market.price);
    }

    function sell(
        ArtistStorage artistStorage,
        string memory ipfsHash,
        uint256 amount
    ) public nonReentrant whenNotPaused {
        require(marketInitialized[ipfsHash], "Market not initialized");
        uint256 tokenId = getTokenIdFromIpfsHash(ipfsHash);
        require(
            balanceOf(msg.sender, tokenId) >= amount,
            "Insufficient balance"
        );

        Market storage market = marketBalances[ipfsHash];
        uint256 kn = getK(ipfsHash);
        market.nftBalance -= amount;
        uint256 factor = (kn / (market.nftBalance));
        uint256 diff = (factor) - market.mercatBalance;
        market.mercatBalance = factor;
        require(market.price * 10**6 > diff, "Sell price underflow");
        uint256 sellPrice = ((market.price) * (10**6)) - diff;

        market.price = (sellPrice) / 10**6;
        uint256 fee = (sellPrice * feePercentage) / 100;
        uint256 totalPrice = sellPrice - fee;

        mercatToken.mint(msg.sender,amount * ((totalPrice)*(10**12)));

        _burn(msg.sender, tokenId, amount);
        market.countNFTs = market.countNFTs - amount;

        uint256 ownerFee = (fee * ownerFeePercentage) / 100;

        uint256 marketFee = fee - ownerFee;
        market.mercatBalance += (marketFee);
        ownerFees += (ownerFee / 10**6);

        artistStorage.updateArtistReputation(market.artist);
        emit NFTSold(msg.sender, tokenId, amount, market.price, fee);
        priceHistory[ipfsHash].push(market.price);
    }

    function getMarketDetails(string memory ipfsHash)
        public
        view
        returns (
            string memory name,
            string memory description,
            string memory theme,
            string memory image,
            uint256 price,
            string memory perks,
            address artist,
            uint256 countNFTs
        )
    {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage market = marketBalances[ipfsHash];
        return (
            market.name,
            market.description,
            market.theme,
            market.image,
            market.price,
            market.perks,
            market.artist,
            market.countNFTs
        );
    }

    function getNFTPrice(string memory ipfsHash)
        public
        view
        returns (uint256 price)
    {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage market = marketBalances[ipfsHash];

        price = market.price;
    }

    function getMERCATPrice(string memory ipfsHash)
        public
        view
        returns (uint256 price)
    {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage balance = marketBalances[ipfsHash];
        price = (balance.mercatBalance);
    }

    function getK(string memory ipfsHash) public view returns (uint256 k) {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage balance = marketBalances[ipfsHash];
        k = (balance.mercatBalance * balance.nftBalance);
    }

    function getTokenIdFromIpfsHash(string memory ipfsHash)
        public
        view
        returns (uint256)
    {
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (
                keccak256(bytes(tokenIdToIpfsHash[i])) ==
                keccak256(bytes(ipfsHash))
            ) {
                return i;
            }
        }
        revert("IPFS hash not found");
    }

    function withdrawOwnerFees() public onlyOwner {
        uint256 amount = ownerFees;
        ownerFees = 0;
        require(
            mercatToken.transfer(owner(), amount),
            "MERCAT transfer failed"
        );
    }

    function convertETHToMERCAT() public payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        uint256 mercatAmount = (msg.value * ETH_TO_MERCAT_RATE);

        ethReserve += msg.value;
        mercatToken.mint(msg.sender, mercatAmount);

        emit ETHToMERCATConverted(msg.sender, msg.value, mercatAmount);
    }

    function convertMERCATToETH(uint256 mercatAmount) public nonReentrant {
        require(mercatAmount > 0, "Must convert non-zero amount");
        uint256 ethAmount = mercatAmount / ETH_TO_MERCAT_RATE;
        require(ethReserve >= ethAmount, "Insufficient ETH reserve");

        mercatToken.burn(msg.sender, mercatAmount);
        ethReserve -= ethAmount;

        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit MERCATToETHConverted(msg.sender, mercatAmount, ethAmount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    receive() external payable {
        convertETHToMERCAT();
    }
}