const { expect } = require("chai");

describe("CarbonCreditToken and Marketplace", function () {
  let Token, Marketplace, token, marketplace, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    Token = await ethers.getContractFactory("CarbonCreditToken");
    token = await Token.deploy();
    await token.waitForDeployment();

    Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(token.target);
    await marketplace.waitForDeployment();

    await token.setMinter(addr1.address, true);
  });

  it("Mint tokens by minter", async function () {
    await token.connect(addr1).mint(addr1.address, 1000);
    expect(await token.balanceOf(addr1.address)).to.equal(1000);
  });

  it("List tokens and buy tokens", async function () {
    await token.connect(addr1).mint(addr1.address, 1000);
    await token.connect(addr1).approve(marketplace.target, 1000);

    await marketplace.connect(addr1).listTokens(500, 1);

    const listing = await marketplace.listings(0);
    expect(listing.amount).to.equal(500);
    expect(listing.price).to.equal(1);

    await marketplace.connect(owner).buyTokens(0, { value: 500 });

    expect(await token.balanceOf(owner.address)).to.equal(500);
    expect(await token.balanceOf(addr1.address)).to.equal(500);
  });
});
