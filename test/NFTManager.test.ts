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
  it("equipNFT success", async function () {
    const [player] = await ethers.getSigners();
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);


    await nft.setApprovalForAll(nftManager.address, true);
    await nftManager.connect(player).equipNFT(1);
    await nftManager.connect(player).equipNFT(2);
    await nftManager.connect(player).equipNFT(3);

    const pools = await nftManager.getAllNFT(player.address);
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

    await nftManager.connect(player).withdrawNFT(1);
    await nftManager.connect(player).withdrawNFT(2);

    const poolsAfterWithdraw = await nftManager.getAllNFT(player.address);

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

  it("changes NFT success", async function () {
    const [player] = await ethers.getSigners();
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    await nft.mintToken(player.address, 1, 1, 1, 1, 1, 1, 1, 1, 1);

    await nft.setApprovalForAll(nftManager.address, true);
    await nftManager.connect(player).equipNFT(1);
    await nftManager.connect(player).equipNFT(2);

    await nftManager.connect(player).changeNFT(1, 3);

    const poolsAfterChange = await nftManager.getAllNFT(player.address);

    // update pool success
    expect(poolsAfterChange[0].toNumber()).to.equal(0);
    expect(poolsAfterChange[1].toNumber()).to.equal(2);
    expect(poolsAfterChange[2].toNumber()).to.equal(3);

    // nft is withdrawn to the wallet of player

    const ownerNFT1 = await nft.ownerOf(1);

    expect(ownerNFT1).to.equal(player.address);

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
});
