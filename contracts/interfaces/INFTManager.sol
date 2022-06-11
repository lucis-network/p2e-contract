//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INFTManager {
    // event
    event EquipNFT(address indexed owner, uint256 tokenId);
    event UnequipNFT(address indexed owner, uint256 tokenId);
    event ChangeNFTEquipped(
        address indexed owner,
        uint256 preTokenId,
        uint256 nextTokenId
    );

    event EquipNFTAssigned(
        address indexed owner,
        address indexed gamer,
        uint256 tokenId
    );

    event UnequipNFTAssigned(
        address indexed owner,
        address indexed gamer,
        uint256 tokenId
    );

    event AssignToGamer(
        address indexed investor,
        address indexed gamer,
        uint256 tokenId
    );

    event WithdrawNFT(address indexed investor, uint256 tokenId);

    struct Detail {
        address investor;
        address gamer;
        uint256 sharingPercentForGamer; // example: 30% (< 100%)
        uint256 tokenId;
        bool isEquip;
    }

    function getAllNFTOfGamer(address gamer)
        external
        view
        returns (uint256[] memory list);

    function getAllNFTOfInvertor(address investor)
        external
        view
        returns (uint256[] memory list);

    function getAllNFTAssigned() external view returns (Detail[] memory);

    // function getAllNFTAssigned() external view returns (Detail[] memory) {
    //     return nftAssignedList;
    // }
    // for investor
    function assignToGamer(
        address gamer,
        uint256 tokenId,
        uint256 _sharingPercentForGamer
    ) external;

    function withdrawNFT(uint256 tokenId) external;

    // for gamer
    function equipNFTAssigned(uint256 tokenId) external;

    function equipNFT(uint256 tokenId) external;

    function unequipNFT(uint256 tokenId) external;

    function unequipNFTAssigned(uint256 tokenId) external;
}
