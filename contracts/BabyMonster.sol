// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@quant-finance/solidity-datetime/contracts/DateTime.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract BabyMonster is ERC1155Pausable, Ownable {
    uint256[] public _faucetAmount;
    mapping(address => uint256) public _stacking;
    mapping(address => uint256) public _NextAvailableFaucet;
    uint256 public _totalStacked;
    address public _MSTTokenAddress;
    uint256 public _MintFeeInMST;

    error TimeLock();
    error AlreadyStacked();
    error NotStacked();

    constructor(
        string memory baseURI,
        address mstTokenAddress,
        uint256 mintFee
    ) ERC1155(baseURI) {
        _faucetAmount.push(1);
        _faucetAmount.push(50);
        _MSTTokenAddress = mstTokenAddress;
        _MintFeeInMST = mintFee;
    }

    function updateFaucetAmount(
        uint256 withoutStacking,
        uint256 withStacking
    ) public onlyOwner {
        _faucetAmount[0] = withoutStacking;
        _faucetAmount[1] = withStacking;
    }

    function Mint() public {
        IERC20(_MSTTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _MintFeeInMST * (10 ** 18)
        );
        _mint(msg.sender, 1, 1, "");
    }

    function Airdrop(address[] memory targetAirdropAddresses) public onlyOwner {
        for (uint256 i = 0; i < targetAirdropAddresses.length; i++) {
            _mint(targetAirdropAddresses[i], 1, 1, "");
        }
    }

    function WithdrawalTokens() public onlyOwner {
        IERC20(_MSTTokenAddress).transfer(
            msg.sender,
            IERC20(_MSTTokenAddress).balanceOf(address(this))
        );
    }

    function GetFaucet() public whenNotPaused {
        if (_NextAvailableFaucet[msg.sender] > block.timestamp) {
            revert TimeLock();
        }
        _NextAvailableFaucet[msg.sender] = DateTime.addDays(block.timestamp, 1);
        uint256 faucetAmount = _faucetAmount[0];
        if (_stacking[msg.sender] != 0) {
            faucetAmount = _faucetAmount[1];
        }
        IERC20(_MSTTokenAddress).transfer(
            msg.sender,
            faucetAmount * (10 ** 18)
        );
    }

    function Stack() public {
        require(GetAvailableTokenCount() > 0, "You don`t have BabyMonster");
        if (_stacking[msg.sender] != 0) {
            revert AlreadyStacked();
        }
        _totalStacked = _totalStacked + 1;
        _stacking[msg.sender] = 1;
    }

    function Unstack() public {
        if (_stacking[msg.sender] == 0) {
            revert NotStacked();
        }
        _totalStacked = _totalStacked - 1;
        _stacking[msg.sender] = 0;
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );
        require(
            GetAvailableTokenCount() >= amount,
            "You do not have this NFT available"
        );
        _safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: transfer caller is not owner nor approved"
        );
        require(false, "Batch transfer is not allowed");
        _safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function GetAvailableTokenCount() public view returns (uint256) {
        return balanceOf(msg.sender, 1) - _stacking[msg.sender];
    }

    function UpdateMintFee(uint256 mintFee) public onlyOwner {
        _MintFeeInMST = mintFee;
    }

    function PauseUnpause() public onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }
}
