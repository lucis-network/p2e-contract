//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/INFTManager.sol";

contract NFTManager is Context, AccessControl, Ownable, INFTManager {
    // variables
    IERC721 private nft;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    // mapping
    mapping(address => uint256[]) public pools;

    mapping(address => uint256[]) public investorPools;

    Detail[] public nftAssignedList;

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

    function getAllNFTOfGamer(address gamer)
        external
        view
        override
        returns (uint256[] memory list)
    {
        return pools[gamer];
    }

    function getAllNFTOfInvertor(address gamer)
        external
        view
        override
        returns (uint256[] memory list)
    {
        return investorPools[gamer];
    }

    function getAllNFTAssigned()
        external
        view
        override
        returns (Detail[] memory)
    {
        return nftAssignedList;
    }

    function assignToGamer(
        address gamer,
        uint256 tokenId,
        uint256 _sharingPercentForGamer
    ) external override {
        address investor = msg.sender;
        require(tokenId != 0, "NFTManager: tokenId is zero");
        require(
            _sharingPercentForGamer <= 100,
            "NFTManager: Sharing percent for gamer is > 100"
        );

        nft.transferFrom(investor, address(this), tokenId);

        Detail memory newDetail = Detail(
            investor,
            gamer,
            _sharingPercentForGamer,
            tokenId,
            false
        );

        nftAssignedList.push(newDetail);
        investorPools[investor].push(tokenId);

        emit AssignToGamer(investor, gamer, tokenId);
    }

    function withdrawNFT(uint256 tokenId) external override {
        address investor = msg.sender;
        require(tokenId != 0, "NFTManager: tokenId is zero");

        Detail[] storage listNFTDetail = nftAssignedList;

        bool hasAssigned = false;
        uint256 indexDetail = 0;
        for (uint256 i = 0; i < listNFTDetail.length; i++) {
            if (listNFTDetail[i].tokenId == tokenId) {
                hasAssigned = true;
                indexDetail = i;
                break;
            }
        }

        require(hasAssigned, "NFTManager: tokenId is not exist");

        delete listNFTDetail[indexDetail];

        (bool hasExist, uint256 index) = _hasAssetInInvestorPool(
            investor,
            tokenId
        );
        delete investorPools[investor][index];

        nft.transferFrom(address(this), investor, tokenId);

        emit WithdrawNFT(investor, tokenId);
    }

    function equipNFTAssigned(uint256 tokenId) external override {
        address user = msg.sender;
        require(tokenId != 0, "NFTManager: tokenId is zero");

        Detail[] storage listNFTDetail = nftAssignedList;

        bool hasAssigned = false;
        uint256 indexDetail = 0;
        for (uint256 i = 0; i < listNFTDetail.length; i++) {
            if (listNFTDetail[i].tokenId == tokenId) {
                hasAssigned = true;
                indexDetail = i;
                break;
            }
        }

        require(hasAssigned, "NFTManager: tokenId is not exist");

        Detail storage detail = listNFTDetail[indexDetail];

        require(!detail.isEquip, "NFTManager: nft has been equipped");
        detail.isEquip = true;

        emit EquipNFTAssigned(detail.investor, user, tokenId);
    }

    function equipNFT(uint256 tokenId) external override {
        address user = msg.sender;
        require(tokenId != 0, "NFTManager: tokenId is zero");

        nft.transferFrom(user, address(this), tokenId);

        pools[user].push(tokenId);
        emit EquipNFT(user, tokenId);
    }

    function unequipNFT(uint256 tokenId) external override {
        address user = msg.sender;
        require(tokenId != 0, "NFTManager: tokenId is zero");
        (bool hasExist, uint256 index) = _hasAssetInPool(user, tokenId);
        require(hasExist, "NFTManager: tokenId is not in pool");
        nft.transferFrom(address(this), user, tokenId);

        delete pools[user][index];
        emit UnequipNFT(user, tokenId);
    }

    function unequipNFTAssigned(uint256 tokenId) external override {
        address user = msg.sender;
        require(tokenId != 0, "NFTManager: tokenId is zero");

        Detail[] storage listNFTDetail = nftAssignedList;

        bool hasAssigned = false;
        uint256 indexDetail = 0;
        for (uint256 i = 0; i < listNFTDetail.length; i++) {
            if (listNFTDetail[i].tokenId == tokenId) {
                hasAssigned = true;
                indexDetail = i;
                break;
            }
        }

        require(hasAssigned, "NFTManager: tokenId is not exist");

        Detail storage detail = listNFTDetail[indexDetail];

        require(detail.isEquip, "NFTManager: nft has not been equipped");
        detail.isEquip = false;

        emit UnequipNFTAssigned(detail.investor, user, tokenId);
    }

    // function changeNFTEquipped(uint256 preTokenId, uint256 nextTokenId)
    //     external
    // {
    //     address user = msg.sender;
    //     require(preTokenId != 0, "NFTManager: tokenId is zero");
    //     (bool hasExist, uint256 index, bool nftAssigned) = _hasAsset(
    //         user,
    //         preTokenId
    //     );
    //     require(hasExist, "NFTManager: tokenId is not in pool");

    //     if (!nftAssigned) {
    //         // transfer pre nft to user
    //         nft.transferFrom(address(this), user, preTokenId);

    //         // user transfers nft to pool
    //         nft.transferFrom(user, address(this), nextTokenId);
    //         // update pool
    //         delete pools[user][index];
    //         pools[user].push(nextTokenId);
    //     } else {}

    //     emit ChangeNFTEquipped(user, preTokenId, nextTokenId);
    // }

    function _hasAssetInPool(address user, uint256 tokenId)
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

    function _hasAssetInInvestorPool(address user, uint256 tokenId)
        internal
        view
        returns (bool hasExist, uint256 index)
    {
        hasExist = false;
        index = 0;
        for (uint256 i = 0; i < investorPools[user].length; i++) {
            if (tokenId == investorPools[user][i]) {
                hasExist = true;
                index = i;
                break;
            }
        }
    }
}
