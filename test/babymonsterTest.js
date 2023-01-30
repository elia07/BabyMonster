const { ethers, deployments } = require("hardhat");
const { assert, expect } = require("chai");
const { helpers } = require("@nomicfoundation/hardhat-network-helpers");

describe("babymonster", function () {
  let babyMonster;
  let mstToken;

  beforeEach(async function () {
    //babyMonsterFactory = await ethers.getContractFactory("BabyMonster");
    //babyMonster = await babyMonsterFactory.deploy();
    //await hre.run("deploy");
    await deployments.fixture(["mocks", "all"]);
    //babyMonster = await deployments.get("BabyMonster");
    babyMonster = await ethers.getContract("BabyMonster");
    mstToken = await ethers.getContract("MSTToken");
    console.log(`BabyMonster Address:${babyMonster.address}`);
  });

  it("Airdrop an NFT", async function () {
    //Arrange
    let { deployer, user1, user2 } = await getNamedAccounts();
    const [owner, _user1] = await ethers.getSigners();
    let user1TokenCount = parseInt(await babyMonster.balanceOf(user1, 1));

    //Act
    await babyMonster.Airdrop([_user1.address]);

    //Assert
    assert.equal(
      user1TokenCount + 1,
      parseInt(await babyMonster.balanceOf(user1, 1))
    );

    assert.equal(
      parseInt(await babyMonster.connect(_user1).GetAvailableTokenCount()),
      parseInt(await babyMonster.balanceOf(user1, 1))
    );
  });

  it("faucet without stacking", async function () {
    //arrange
    let { deployer } = await getNamedAccounts();
    const [owner, user1] = await ethers.getSigners();
    let user1MSTBalance =
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18;

    //act
    await babyMonster.connect(user1).GetFaucet();
    //assert
    assert.equal(
      user1MSTBalance + 1,
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18
    );
  });

  it("faucet with stacking", async function () {
    //arrange
    let { deployer } = await getNamedAccounts();
    const [owner, user1] = await ethers.getSigners();
    let user1MSTBalance =
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18;

    //act
    await babyMonster.Airdrop([user1.address]);
    await babyMonster.connect(user1).Stack();
    await babyMonster.connect(user1).GetFaucet();
    //assert
    assert.equal(
      user1MSTBalance + 50,
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18
    );
  });

  it("faucet time lock", async function () {
    //arrange
    let { deployer } = await getNamedAccounts();
    const [owner, user1] = await ethers.getSigners();
    let user1MSTBalance =
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18;

    //act
    await babyMonster.Airdrop([user1.address]);
    await babyMonster.connect(user1).Stack();
    await babyMonster.connect(user1).GetFaucet();
    //assert
    await expect(babyMonster.connect(user1).GetFaucet()).to.be.reverted;

    //act
    //await helpers.time.increase(3600 * 24);
    //await ethers.provider.send("evm_mine", [newTimestampInSeconds]);
    const oneDay = 1 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [oneDay]);
    await ethers.provider.send("evm_mine");

    user1MSTBalance =
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18;
    await babyMonster.connect(user1).GetFaucet();

    //assert
    assert.equal(
      user1MSTBalance + 50,
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18
    );
  });

  it("UnStack", async function () {
    //arrange
    let { deployer } = await getNamedAccounts();
    const [owner, user1] = await ethers.getSigners();
    let user1MSTBalance =
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18;

    //act
    await babyMonster.Airdrop([user1.address]);
    await babyMonster.connect(user1).Stack();
    await babyMonster.connect(user1).Unstack();
    await babyMonster.connect(user1).GetFaucet();
    //assert
    assert.equal(
      user1MSTBalance + 1,
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18
    );
  });

  it("UpdateFaucetAmount", async function () {
    //arrange
    let { deployer } = await getNamedAccounts();
    const [owner, user1] = await ethers.getSigners();
    let amount1 = parseInt(await babyMonster._faucetAmount(0));
    let amount2 = parseInt(await babyMonster._faucetAmount(1));

    //act
    await babyMonster.updateFaucetAmount(2, 100);
    //assert
    assert.notEqual(amount1, parseInt(await babyMonster._faucetAmount(0)));
    assert.notEqual(amount2, parseInt(await babyMonster._faucetAmount(1)));
    assert.equal(2, parseInt(await babyMonster._faucetAmount(0)));
    assert.equal(100, parseInt(await babyMonster._faucetAmount(1)));
  });
  it("WithdrawalTokens", async function () {
    //arrange
    let { deployer } = await getNamedAccounts();
    const [owner, user1] = await ethers.getSigners();
    let deployerBalance =
      parseInt(await mstToken.balanceOf(owner.address)) / 10 ** 18;
    let contractBalance =
      parseInt(await mstToken.balanceOf(babyMonster.address)) / 10 ** 18;
    //act
    const transactionResponse = await babyMonster.WithdrawalTokens();
    const transactionReceipt = await transactionResponse.wait();
    const { gasUsed, effectiveGasPrice } = transactionReceipt;
    const gasCost = gasUsed.mul(effectiveGasPrice);
    //assert
    assert.equal(
      0,
      parseInt(await mstToken.balanceOf(babyMonster.address)) / 10 ** 18
    );
    assert.equal(
      deployerBalance + contractBalance,
      parseInt(parseInt(await mstToken.balanceOf(owner.address)) / 10 ** 18) + 1
    );
  });
  it("Avoid Double Stack", async function () {
    //arrange
    let { deployer } = await getNamedAccounts();
    const [owner, user1] = await ethers.getSigners();
    let user1MSTBalance =
      parseInt(await mstToken.balanceOf(user1.address)) / 10 ** 18;

    //act
    await babyMonster.Airdrop([user1.address, user1.address]);

    //assert
    assert.equal(2, parseInt(await babyMonster.balanceOf(user1.address, 1)));

    //act
    await babyMonster.connect(user1).Stack();

    //assert
    await expect(babyMonster.connect(user1).Stack()).to.be.reverted;
  });
  it("Avoid safeTransferFrom", async function () {
    //arrange
    let { deployer } = await getNamedAccounts();
    const [owner, user1, user2] = await ethers.getSigners();

    //act
    await babyMonster.Airdrop([user1.address]);
    //act
    await babyMonster.connect(user1).Stack();

    //assert

    await expect(
      babyMonster
        .connect(user1)
        .safeTransferFrom(user1.address, user2.address, 1, 1, [])
    ).to.be.reverted;
  });
});
