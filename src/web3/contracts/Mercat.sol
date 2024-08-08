// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ERC20.sol";

contract Mercat is ERC20 {
    constructor()
        ERC20("Mercat", "MER", 18)
    {
    }
}
