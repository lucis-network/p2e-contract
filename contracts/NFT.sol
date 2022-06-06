//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    constructor() ERC721("p2eNFT", "P2E") {}

    function mint(uint256 tokenId) external {
        _mint(msg.sender, tokenId);
    }
}
