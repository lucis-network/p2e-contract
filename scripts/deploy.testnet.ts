// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import hre from "hardhat";

dotenv.config();

// deploy to bsc testnet
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const LucisNFT = await ethers.getContractFactory("LucisNFT");
  const lucisNFT = await LucisNFT.deploy();

  await lucisNFT.deployed();



  console.log("LucisNFT contract deployed to:", lucisNFT.address);

  // await hre.run('verify:verify', {
  //   address: lucisNFT.address,
  //   constructorArguments: [],
  //   contract: "contracts/LucisNFT.sol:LucisNFT"
  // });

  //console.log("LucisNFT contract verified");

  const NFTManager = await ethers.getContractFactory("NFTManager");
  const nftManager = await NFTManager.deploy(lucisNFT.address);

  await nftManager.deployed();

  console.log("NFTManager contract deployed to:", nftManager.address);
  // await hre.run('verify:verify', {
  //   address: nftManager.address,
  //   constructorArguments: [lucisNFT.address],
  //   contract: "contracts/NFTManager.sol:NFTManager"
  // });

  //console.log("NFTManager contract verified");


  // mint mock nft data
  const addressOwner = process.env.ADDRESS_NFT_OWNER_TESTNET ?? "0x99930b13C50cDb2649d3Ed4D0EbdA1bb50C186c7";
  await lucisNFT.mintToken(addressOwner, 1, 1, 2, 1, 2, 1, 2, 1, 3);
  console.log("minted nft successfully");
  await lucisNFT.mintToken(addressOwner, 3, 1, 2, 2, 2, 1, 2, 1, 3);
  console.log("minted nft successfully");
  await lucisNFT.mintToken(addressOwner, 1, 2, 2, 1, 3, 1, 2, 1, 2);
  console.log("minted nft successfully");
  await lucisNFT.mintToken(addressOwner, 2, 1, 2, 1, 2, 1, 2, 2, 1);
  console.log("minted nft successfully");
  await lucisNFT.mintToken(addressOwner, 2, 1, 2, 1, 2, 1, 2, 1, 2);
  console.log("minted nft successfully");
  await lucisNFT.mintToken(addressOwner, 1, 1, 3, 1, 2, 1, 2, 1, 2);
  console.log("minted nft successfully");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
