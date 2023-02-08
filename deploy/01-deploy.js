// function deployFunc() {
//   console.log("hi");
// }
// module.exports.default = deployFunc;

const { network } = require("hardhat");

// module.exports = async ( { getNamedAccounts, deployments }) => {
// };

// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre;
// };

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { Verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  log(`Deploying contracts to ${network.name} ${chainId} ...`);
  log("-----------------------------");
  let MSTTokenAddress;
  if (developmentChains.includes(network.name)) {
    const mockContract = await deployments.get("MSTToken");
    MSTTokenAddress = mockContract.address;
  } else {
    MSTTokenAddress = network.config["mstTokenAddress"];
  }
  const babyMonsterArgs = ["", MSTTokenAddress, 4000000];
  const babyMonster = await deploy("BabyMonster", {
    from: deployer,
    args: babyMonsterArgs,
    log: true,
    waitConfirmations: network.config.blockConfirmation || 5,
  });
  //mstToken = await ethers.getContract("MSTToken");
  //await mstToken.transfer(babyMonster.address, BigInt(10 ** 18 * 1000));
  if (
    !developmentChains.includes(network.name) &&
    process.env.EXPLORER_API_KEY
  ) {
    await Verify(babyMonster.address, babyMonsterArgs);
  }

  log("-----------------------------");
};

module.exports.tags = ["all", "babymonster"];
