import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("NFTManager contract", function () {
  let nft: Contract;
  let nftManager: Contract;
  beforeEach(async () => {
    const NFT = await ethers.getContractFactory("LucisNFT");
    nft = await NFT.deploy();

    const NFTManager = await ethers.getContractFactory("NFTManager");
    nftManager = await NFTManager.deploy(nft.address);
  })
  // for gamer
  it("equipNFT success", async function () {
    const [player] = await ethers.getSigners();
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);


    await nft.setApprovalForAll(nftManager.address, true);
    await nftManager.connect(player).equipNFT(1);
    await nftManager.connect(player).equipNFT(2);
    await nftManager.connect(player).equipNFT(3);

    const pools = await nftManager.getAllNFTOfGamer(player.address);
    expect(pools[0].toNumber()).to.equal(1);
    expect(pools[1].toNumber()).to.equal(2);
    expect(pools[2].toNumber()).to.equal(3);
  });

  it("withdraw success", async function () {
    const [player] = await ethers.getSigners();
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);

    await nft.setApprovalForAll(nftManager.address, true);
    await nftManager.connect(player).equipNFT(1);
    await nftManager.connect(player).equipNFT(2);
    await nftManager.connect(player).equipNFT(3);

    await nftManager.connect(player).unequipNFT(1);
    await nftManager.connect(player).unequipNFT(2);

    const poolsAfterWithdraw = await nftManager.getAllNFTOfGamer(player.address);

    // update pool success
    expect(poolsAfterWithdraw[0].toNumber()).to.equal(0);
    expect(poolsAfterWithdraw[1].toNumber()).to.equal(0);
    expect(poolsAfterWithdraw[2].toNumber()).to.equal(3);

    // nft is withdrawn to the wallet of player

    const ownerNFT1 = await nft.ownerOf(1);
    const ownerNFT2 = await nft.ownerOf(2);

    expect(ownerNFT1).to.equal(player.address);
    expect(ownerNFT2).to.equal(player.address);

  });

  it("Revert when nft not in pool", async () => {
    const [player] = await ethers.getSigners();
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);

    await nft.setApprovalForAll(nftManager.address, true);
    await nftManager.connect(player).equipNFT(1);
    await nftManager.connect(player).equipNFT(2);

    await expect(nftManager.connect(player).withdrawNFT(5)).to.be.reverted;

  })
  it("Revert when tokenId's nft is zero", async () => {
    const [player] = await ethers.getSigners();
    await expect(nftManager.connect(player).equipNFT(0)).to.be.reverted;

  })

  // for invertor

  it("assign nft for gamer success", async () => {
    const [owner, investor, player] = await ethers.getSigners();
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);

    await nft.connect(investor).setApprovalForAll(nftManager.address, true);
    await nftManager.connect(investor).assignToGamer(player.address, 1, 30);
    await nftManager.connect(investor).assignToGamer(player.address, 2, 50);
    await nftManager.connect(investor).assignToGamer(player.address, 3, 60);


    const poolsInvestor = await nftManager.getAllNFTOfInvertor(investor.address);
    const nftListAssigned = await nftManager.getAllNFTAssigned();

    // update pool success
    expect(poolsInvestor[0].toNumber()).to.equal(1);
    expect(poolsInvestor[1].toNumber()).to.equal(2);
    expect(poolsInvestor[2].toNumber()).to.equal(3);

    expect(nftListAssigned[0].investor).to.equal(investor.address);
    expect(nftListAssigned[0].gamer).to.equal(player.address);
    expect(nftListAssigned[0].sharingPercentForGamer).to.equal(30);
    expect(nftListAssigned[0].tokenId.toNumber()).to.equal(1);
    expect(nftListAssigned[0].isEquip).to.equal(false);

  });
  it("equipNFT assigned success", async () => {
    const [owner, investor, player] = await ethers.getSigners();
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);

    await nft.connect(investor).setApprovalForAll(nftManager.address, true);
    await nftManager.connect(investor).assignToGamer(player.address, 1, 30);
    await nftManager.connect(investor).assignToGamer(player.address, 2, 50);
    await nftManager.connect(investor).assignToGamer(player.address, 3, 60);

    await nftManager.connect(player).equipNFTAssigned(1);



    const poolsInvestor = await nftManager.getAllNFTOfInvertor(investor.address);
    const nftListAssigned = await nftManager.getAllNFTAssigned();

    // update pool success
    expect(poolsInvestor[0].toNumber()).to.equal(1);
    expect(poolsInvestor[1].toNumber()).to.equal(2);
    expect(poolsInvestor[2].toNumber()).to.equal(3);

    expect(nftListAssigned[0].investor).to.equal(investor.address);
    expect(nftListAssigned[0].gamer).to.equal(player.address);
    expect(nftListAssigned[0].sharingPercentForGamer).to.equal(30);
    expect(nftListAssigned[0].tokenId.toNumber()).to.equal(1);
    expect(nftListAssigned[0].isEquip).to.equal(true); // update here
  });
  it("unequipNFT assigned success", async () => {
    const [owner, investor, player] = await ethers.getSigners();
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);

    await nft.connect(investor).setApprovalForAll(nftManager.address, true);
    await nftManager.connect(investor).assignToGamer(player.address, 1, 30);
    await nftManager.connect(investor).assignToGamer(player.address, 2, 50);
    await nftManager.connect(investor).assignToGamer(player.address, 3, 60);

    await nftManager.connect(player).equipNFTAssigned(1);
    let nftListAssigned = await nftManager.getAllNFTAssigned();

    expect(nftListAssigned[0].investor).to.equal(investor.address);
    expect(nftListAssigned[0].gamer).to.equal(player.address);
    expect(nftListAssigned[0].sharingPercentForGamer).to.equal(30);
    expect(nftListAssigned[0].tokenId.toNumber()).to.equal(1);
    expect(nftListAssigned[0].isEquip).to.equal(true); // update here

    //unequip
    await nftManager.connect(player).unequipNFTAssigned(1);

    const poolsInvestor = await nftManager.getAllNFTOfInvertor(investor.address);
    nftListAssigned = await nftManager.getAllNFTAssigned();

    // update pool success
    expect(poolsInvestor[0].toNumber()).to.equal(1);
    expect(poolsInvestor[1].toNumber()).to.equal(2);
    expect(poolsInvestor[2].toNumber()).to.equal(3);

    expect(nftListAssigned[0].investor).to.equal(investor.address);
    expect(nftListAssigned[0].gamer).to.equal(player.address);
    expect(nftListAssigned[0].sharingPercentForGamer).to.equal(30);
    expect(nftListAssigned[0].tokenId.toNumber()).to.equal(1);
    expect(nftListAssigned[0].isEquip).to.equal(false); // update here
  });
  it("withdraw nft for investor success", async () => {
    const [owner, investor, player] = await ethers.getSigners();
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(investor.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);

    await nft.connect(investor).setApprovalForAll(nftManager.address, true);
    await nftManager.connect(investor).assignToGamer(player.address, 1, 30);
    await nftManager.connect(investor).assignToGamer(player.address, 2, 50);
    await nftManager.connect(investor).assignToGamer(player.address, 3, 60);

    await nftManager.connect(investor).withdrawNFT(2);

    const poolsInvestor = await nftManager.getAllNFTOfInvertor(investor.address);
    const nftListAssigned = await nftManager.getAllNFTAssigned();


    const ownerNFT1 = await nft.ownerOf(1);
    const ownerNFT2 = await nft.ownerOf(2);

    // update pool success
    expect(poolsInvestor[0].toNumber()).to.equal(1);
    expect(poolsInvestor[1].toNumber()).to.equal(0);
    expect(poolsInvestor[2].toNumber()).to.equal(3);

    // update to default
    expect(nftListAssigned[1].investor).to.equal("0x0000000000000000000000000000000000000000");
    expect(nftListAssigned[1].gamer).to.equal("0x0000000000000000000000000000000000000000");
    expect(nftListAssigned[1].sharingPercentForGamer).to.equal(0);
    expect(nftListAssigned[1].tokenId.toNumber()).to.equal(0);
    expect(nftListAssigned[1].isEquip).to.equal(false); // update here



    expect(ownerNFT1).to.equal(nftManager.address); // update here
    expect(ownerNFT2).to.equal(investor.address); // update here
  });
});
