const { run } = require("hardhat");

async function Verify(contractAddress, args) {
  console.log("Verifying contract...");
  console.log(`contractAddress: ${contractAddress}`);
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
}

module.exports = { Verify };
