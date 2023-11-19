const hre = require('hardhat');

async function main() {
  const contract = await hre.ethers.deployContract('Player', ['Your name here', '0x'], {});

  await contract.waitForDeployment();

  console.log(`Player deployed to ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
