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

  const lucisNFTAddress = "0x52aB650e614aFde5bb2aeEaf56640b5027F9326b"; // replace here
  const NFTManagerAddress = "0x061017427D9Ac586dD85c69d1D24cF6c84689914"; // replace here


  await hre.run('verify:verify', {
    address: lucisNFTAddress,
    constructorArguments: [],
    contract: "contracts/LucisNFT.sol:LucisNFT"
  });

  console.log("LucisNFT contract verified");


  await hre.run('verify:verify', {
    address: NFTManagerAddress,
    constructorArguments: [lucisNFTAddress],
    contract: "contracts/NFTManager.sol:NFTManager"
  });

  console.log("NFTManager contract verified");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
