// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CarbonCreditToken.sol";

contract Marketplace {
    CarbonCreditToken public token;

    struct Listing {
        address seller;
        uint256 amount;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;

    constructor(address tokenAddress) {
        token = CarbonCreditToken(tokenAddress);
    }

    function listTokens(uint256 amount, uint256 price) external {
        require(token.balanceOf(msg.sender) >= amount, "Insufficient tokens");
        require(token.allowance(msg.sender, address(this)) >= amount, "Not approved");

        listings[nextListingId] = Listing(msg.sender, amount, price, true);
        nextListingId++;
    }

    function buyTokens(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.active, "Inactive listing");
        require(msg.value >= listing.price * listing.amount, "Insufficient ETH");

        listing.active = false;

        require(token.transferFrom(listing.seller, msg.sender, listing.amount), "Transfer failed");
        payable(listing.seller).transfer(msg.value);
    }
}
