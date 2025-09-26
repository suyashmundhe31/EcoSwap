async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Token = await ethers.getContractFactory("CarbonCreditToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("CarbonCreditToken deployed to:", token.target);

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(token.target);
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", marketplace.target);

  // Optionally set deployer as a minter
  const tx = await token.setMinter(deployer.address, true);
  await tx.wait();
  console.log("Deployer set as minter.");

  // Additional deployment or initialization here.
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
