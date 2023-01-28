require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
require("hardhat-contract-sizer");
require("@nomicfoundation/hardhat-chai-matchers");
//require("./tasks/sampleTask");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
/** @type import('hardhat/config').HardhatUserConfig */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "";
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const EXPLORER_API_KEY = process.env.EXPLORER_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.17" },
      { version: "0.8.8" },
      { version: "0.6.6" },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    polygon: {
      url: POLYGON_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 137,
      blockConfirmation: 2,
      mstTokenAddress: "0x41C1660267ABE974Cb889bFD41829d4E1313d675",
    },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmation: 2,
      mstTokenAddress: "",
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
      blockConfirmation: 2,
    },
  },
  etherscan: {
    apiKey: EXPLORER_API_KEY,
  },
  polyscan: {
    apiKey: EXPLORER_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user1: {
      default: 1,
    },
    user2: {
      default: 2,
    },
    user3: {
      default: 3,
    },
    user4: {
      default: 4,
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    //only: [":ERC20$"],
  },
};
