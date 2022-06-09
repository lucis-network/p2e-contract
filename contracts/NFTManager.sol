//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract NFTManager is Context, AccessControl, Ownable {
    // event
    event EquipNFT(address indexed owner, uint256 tokenId);
    event WithdrawNFT(address indexed owner, uint256 tokenId);
    event ChangeNFT(
        address indexed owner,
        uint256 preTokenId,
        uint256 nextTokenId
    );
    // variables
    IERC721 private nft;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    // mapping
    mapping(address => uint256[]) public pools;

    // mapping(address => mapping(address => uint256[])) public poolsInvestor;

    // function
    constructor(address _nftContract) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());

        nft = IERC721(_nftContract);
    }

    function setupMinterRole(address account, bool _enable) external {
        require(account != address(0), "ADDRESS_INVALID");
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "NOT_PERMISSION");
        if (_enable) {
            _setupRole(MINTER_ROLE, account);
        } else {
            _revokeRole(MINTER_ROLE, account);
        }
    }

    function getAllNFT(address user)
        public
        view
        returns (uint256[] memory list)
    {
        return pools[user];
    }

    // function approveToGamer(address gamer, uint256 tokenId) external {
    //     address investor = msg.sender;
    //     require(tokenId != 0, "ManageNFT: tokenId is zero");

    //     nft.transferFrom(investor, address(this), tokenId);

    //     poolsInvestor[investor][gamer].push(tokenId);

    // }

    function equipNFT(uint256 tokenId) external {
        address user = msg.sender;
        require(tokenId != 0, "ManageNFT: tokenId is zero");

        nft.transferFrom(user, address(this), tokenId);

        pools[user].push(tokenId);
        emit EquipNFT(user, tokenId);
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

    function changeNFT(uint256 preTokenId, uint256 nextTokenId) external {
        address user = msg.sender;
        require(preTokenId != 0, "ManageNFT: tokenId is zero");
        (bool hasExist, uint256 index) = _hasAsset(user, preTokenId);
        require(hasExist, "ManageNFT: tokenId is not in pool");

        // transfer pre nft to user
        nft.transferFrom(address(this), user, preTokenId);

        // user transfers nft to pool
        nft.transferFrom(user, address(this), nextTokenId);
        // update pool
        delete pools[user][index];
        pools[user].push(nextTokenId);
        emit ChangeNFT(user, preTokenId, nextTokenId);
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
