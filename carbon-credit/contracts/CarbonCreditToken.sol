// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditToken is ERC20, Ownable {
    mapping(address => bool) public minters;

    event MinterSet(address indexed minter, bool status);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("CarbonCreditToken", "CCT") Ownable(msg.sender) {}

    modifier onlyMinter() {
        require(minters[msg.sender], "Not authorized minter");
        _;
    }

    function setMinter(address _minter, bool _status) external onlyOwner {
        require(_minter != address(0), "Zero address");
        minters[_minter] = _status;
        emit MinterSet(_minter, _status);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
}
