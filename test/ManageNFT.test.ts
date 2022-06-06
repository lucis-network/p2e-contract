import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("ManageNFT contract", function () {
  let nft: Contract;
  let manageNFT: Contract;
  beforeEach(async () => {
    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy();

    const ManageNFT = await ethers.getContractFactory("ManageNFT");
    manageNFT = await ManageNFT.deploy(nft.address);
  })
  it("depositNFT success", async function () {
    const [player] = await ethers.getSigners();
    await nft.connect(player).mint(1);
    await nft.connect(player).mint(2);
    await nft.connect(player).mint(3);

    await nft.connect(player).setApprovalForAll(manageNFT.address, true);
    await manageNFT.connect(player).depositNFT(1);
    await manageNFT.connect(player).depositNFT(2);
    await manageNFT.connect(player).depositNFT(3);

    const pools = await manageNFT.getAllNFT(player.address);
    expect(pools[0].toNumber()).to.equal(1);
    expect(pools[1].toNumber()).to.equal(2);
    expect(pools[2].toNumber()).to.equal(3);
  });

  it("withdraw success", async function () {
    const [player] = await ethers.getSigners();
    await nft.connect(player).mint(1);
    await nft.connect(player).mint(2);
    await nft.connect(player).mint(3);

    await nft.connect(player).setApprovalForAll(manageNFT.address, true);
    await manageNFT.connect(player).depositNFT(1);
    await manageNFT.connect(player).depositNFT(2);
    await manageNFT.connect(player).depositNFT(3);

    await manageNFT.connect(player).withdrawNFT(1);
    await manageNFT.connect(player).withdrawNFT(2);

    const poolsAfterWithdraw = await manageNFT.getAllNFT(player.address);

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
    await nft.connect(player).mint(1);
    await nft.connect(player).mint(2);

    await nft.connect(player).setApprovalForAll(manageNFT.address, true);
    await manageNFT.connect(player).depositNFT(1);
    await manageNFT.connect(player).depositNFT(2);

    await expect(manageNFT.connect(player).withdrawNFT(5)).to.be.reverted;

  })
  it("Revert when tokenId's nft is zero", async () => {
    const [player] = await ethers.getSigners();
    await expect(manageNFT.connect(player).depositNFT(0)).to.be.reverted;

  })
});
