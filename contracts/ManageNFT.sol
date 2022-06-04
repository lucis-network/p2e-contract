//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ManageNFT {
    // event
    event DepositNFT(address indexed owner, uint256 tokenId);
    event WithdrawNFT(address indexed owner, uint256 tokenId);
    // variables
    IERC721 private nft;
    // mapping
    mapping(address => uint256[]) public pools;

    // function
    constructor(address _nftContract) {
        nft = IERC721(_nftContract);
    }

    function getAllNFT(address user)
        public
        view
        returns (uint256[] memory list)
    {
        return pools[user];
    }

    function depositNFT(uint256 tokenId) external {
        address user = msg.sender;
        require(tokenId != 0, "ManageNFT: tokenId is zero");

        nft.transferFrom(user, address(this), tokenId);

        pools[user].push(tokenId);
        emit DepositNFT(user, tokenId);
    }

    function withdrawNFT(uint256 tokenId) external {
        address user = msg.sender;
        require(tokenId != 0, "ManageNFT: tokenId is zero");
        (bool hasExist, uint256 index) = _hasAsset(user, tokenId);
        require(hasExist, "ManageNFT: tokenId is not in pool");
        nft.transferFrom(address(this), user, tokenId);

        delete pools[user][index];
        emit WithdrawNFT(user, tokenId);
    }

    function _hasAsset(address user, uint256 tokenId)
        internal
        view
        returns (bool hasExist, uint256 index)
    {
        hasExist = false;
        index = 0;
        for (uint256 i = 0; i < pools[user].length; i++) {
            if (tokenId == pools[user][i]) {
                hasExist = true;
                index = i;
                break;
            }
        }
    }
}
