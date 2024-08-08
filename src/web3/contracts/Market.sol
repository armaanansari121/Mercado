// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ConstantProductERC1155Pricing is ERC1155, Ownable, ReentrancyGuard, Pausable {
    ERC20 public mercatToken;

    uint256 private constant SCALE = 1e6;
    uint256 private constant INITIAL_MERCAT_BALANCE = 1000000 * 1e18; // 1 million MERCAT
    uint256 private constant INITIAL_NFT_BALANCE = 100 * SCALE;

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
        address Artist;
    }

    // Global token ID counter
    uint256 public nextTokenId = 1;

    // Mapping from IPFS hash to Market
    mapping(string => Market) public marketBalances;
    mapping(string => bool) public marketInitialized;
    // mapping(address=> mapping (uint => Market)) public marketOwner;

    // Mapping from token ID to IPFS hash
    mapping(uint256 => string) public tokenIdToIpfsHash;

    uint256 public ownerFees;
    uint256 public ethReserve;

    uint256 public feePercentage = 15;
    uint256 public ownerFeePercentage = 7;
    uint256 public marketFeePercentage = 8;
    uint256 public maxPriceImpact = 10; // 10% max price impact

    uint256 public constant ETH_TO_MERCAT_RATE = 100000; // 1 ETH = 100000 MERCAT

    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 amount, uint256 price, uint256 fee);
    event NFTSold(address indexed from, uint256 indexed tokenId, uint256 amount, uint256 price, uint256 fee);
    event FeesUpdated(uint256 newFeePercentage, uint256 newOwnerFeePercentage, uint256 newMarketFeePercentage);
    event MaxPriceImpactUpdated(uint256 newMaxPriceImpact);
    event ETHToMERCATConverted(address indexed user, uint256 ethAmount, uint256 mercatAmount);
    event MERCATToETHConverted(address indexed user, uint256 mercatAmount, uint256 ethAmount);
    event MarketInitialized(string ipfsHash, uint256 tokenId);

    constructor(address _mercatTokenAddress, string memory _baseUri) ERC1155(_baseUri) Ownable(msg.sender) {
        mercatToken = ERC20(_mercatTokenAddress);
    }

    function initializeMarket(string memory ipfsHash,string memory name,string memory description,string memory theme,uint256 price,string memory perks) public {
        require(!marketInitialized[ipfsHash], "Market already initialized");
        marketBalances[ipfsHash] = Market(INITIAL_MERCAT_BALANCE, INITIAL_NFT_BALANCE,name,description,theme,ipfsHash,price,perks,msg.sender);
        marketInitialized[ipfsHash] = true;
        // marketOwner[msg.sender].push(marketBalances[ipfsHash]);
        // Associate the new token ID with the IPFS hash
        tokenIdToIpfsHash[nextTokenId] = ipfsHash;
        emit MarketInitialized(ipfsHash, nextTokenId);
        nextTokenId++;
    }

    function setFees(uint256 _feePercentage, uint256 _ownerFeePercentage) external onlyOwner {
        require(_feePercentage >= _ownerFeePercentage, "Owner fee cannot exceed total fee");
        feePercentage = _feePercentage;
        ownerFeePercentage = _ownerFeePercentage;
        marketFeePercentage = _feePercentage - _ownerFeePercentage;
        emit FeesUpdated(feePercentage, ownerFeePercentage, marketFeePercentage);
    }

    function setMaxPriceImpact(uint256 _maxPriceImpact) external onlyOwner {
        maxPriceImpact = _maxPriceImpact;
        emit MaxPriceImpactUpdated(maxPriceImpact);
    }

    function mint(string memory ipfsHash, uint256 amount) public nonReentrant whenNotPaused {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage market = marketBalances[ipfsHash];

        uint256 basePrice = market.price;
        uint256 fee = (basePrice * feePercentage) / 100;
        uint256 totalPrice = basePrice + fee;

        uint256 priceImpact = calculatePriceImpact(ipfsHash, true, basePrice);
        require(priceImpact <= maxPriceImpact, "Price impact too high");

        require(mercatToken.transferFrom(msg.sender, address(this), totalPrice), "MERCAT transfer failed");

        uint256 ownerFee = (fee * ownerFeePercentage) / feePercentage;
        uint256 marketFee = fee - ownerFee;

        market.mercatBalance += basePrice + marketFee;
        ownerFees += ownerFee;
        market.nftBalance -= SCALE;

        // Find the token ID associated with this IPFS hash
        uint256 tokenId = getTokenIdFromIpfsHash(ipfsHash);
        _mint(msg.sender, tokenId, amount, "");

        emit NFTMinted(msg.sender, tokenId, amount, basePrice, fee);
    }

    function sell(string memory ipfsHash, uint256 amount) public nonReentrant whenNotPaused {
        require(marketInitialized[ipfsHash], "Market not initialized");
        uint256 tokenId = getTokenIdFromIpfsHash(ipfsHash);
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");

        Market storage market = marketBalances[ipfsHash];

        uint256 basePrice = getNFTPrice(ipfsHash);
        uint256 fee = (basePrice * feePercentage) / 100;
        uint256 totalPrice = basePrice - fee;

        uint256 priceImpact = calculatePriceImpact(ipfsHash, false, basePrice);
        require(priceImpact <= maxPriceImpact, "Price impact too high");

        _burn(msg.sender, tokenId, amount);

        uint256 ownerFee = (fee * ownerFeePercentage) / feePercentage;
        uint256 marketFee = fee - ownerFee;

        market.mercatBalance -= (totalPrice + marketFee);
        ownerFees += ownerFee;
        market.nftBalance += SCALE;

        require(mercatToken.transfer(msg.sender, totalPrice), "MERCAT transfer failed");

        emit NFTSold(msg.sender, tokenId, amount, basePrice, fee);
    }

    function getMarketDetails(string memory ipfsHash) public view returns (string memory name, string memory description, string memory theme, string memory image, uint256 price, string memory perks, address artist) {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage market = marketBalances[ipfsHash];
        return (market.name, market.description, market.theme, market.image, market.price, market.perks, market.Artist);
    }

    function getNFTPrice(string memory ipfsHash) public view returns (uint256 price) {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage balance = marketBalances[ipfsHash];
        price = (balance.mercatBalance * SCALE) / balance.nftBalance;
    }

    function getMERCATPrice(string memory ipfsHash) public view returns (uint256 price) {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage balance = marketBalances[ipfsHash];
        price = (balance.mercatBalance * SCALE) / (balance.nftBalance + SCALE);
    }

    function getK(string memory ipfsHash) public view returns (uint256 k) {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage balance = marketBalances[ipfsHash];
        k = balance.mercatBalance * balance.nftBalance / SCALE;
    }

    function calculatePriceImpact(string memory ipfsHash, bool isMinting, uint256 amount) public view returns (uint256) {
        require(marketInitialized[ipfsHash], "Market not initialized");
        Market storage balance = marketBalances[ipfsHash];
        uint256 startPrice = isMinting ? getNFTPrice(ipfsHash) : getMERCATPrice(ipfsHash);
        uint256 endPrice;
        
        if (isMinting) {
            uint256 newMercatBalance = balance.mercatBalance + amount;
            uint256 newNftBalance = balance.nftBalance - SCALE;
            endPrice = (newMercatBalance * SCALE) / newNftBalance;
        } else {
            uint256 newMercatBalance = balance.mercatBalance - amount;
            uint256 newNftBalance = balance.nftBalance + SCALE;
            endPrice = (newMercatBalance * SCALE) / (newNftBalance + SCALE);
        }
        
        return ((endPrice > startPrice ? endPrice - startPrice : startPrice - endPrice) * 100) / startPrice;
    }

    function getTokenIdFromIpfsHash(string memory ipfsHash) public view returns (uint256) {
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (keccak256(bytes(tokenIdToIpfsHash[i])) == keccak256(bytes(ipfsHash))) {
                return i;
            }
        }
        revert("IPFS hash not found");
    }

    function withdrawOwnerFees() public onlyOwner {
        uint256 amount = ownerFees;
        ownerFees = 0;
        require(mercatToken.transfer(owner(), amount), "MERCAT transfer failed");
    }

    function convertETHToMERCAT() public payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        uint256 mercatAmount = (msg.value * ETH_TO_MERCAT_RATE);
        require(mercatToken.balanceOf(address(this)) >= mercatAmount, "Insufficient MERCAT balance");
        
        ethReserve += msg.value;
        require(mercatToken.approve(msg.sender, mercatAmount),"MERCAT approve failed");
        require( mercatToken.transfer(msg.sender, mercatAmount), "MERCAT transfer failed");
        
        emit ETHToMERCATConverted(msg.sender, msg.value, mercatAmount);
    }

    function convertMERCATToETH(uint256 mercatAmount) public nonReentrant {
        require(mercatAmount > 0, "Must convert non-zero amount");
        uint256 ethAmount = mercatAmount / ETH_TO_MERCAT_RATE;
        require(ethReserve >= ethAmount, "Insufficient ETH reserve");
        
        require(mercatToken.transferFrom(msg.sender, address(this), mercatAmount), "MERCAT transfer failed");
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