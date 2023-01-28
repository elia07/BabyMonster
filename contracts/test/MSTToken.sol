// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MSTToken is ERC20, Ownable {
    constructor() ERC20("MonsterSoccer", "MST") {
        _mint(msg.sender, 100000000000 * (10 ** 18));
    }

    function mint(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount * (10 ** 18));
    }
}
