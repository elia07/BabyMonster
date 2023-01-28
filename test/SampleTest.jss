const { ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("sampleTest", function () {
  let babyMonsterFactory, babyMonster;
  beforeeach(async function () {
    babyMonsterFactory = await ethers.getContractFactory("BabyMonster");
    babyMonster = await babyMonsterFactory.deploy();
  });
});

it("raw test", async function () {
  //assert
  //expect
});
