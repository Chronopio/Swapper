const { ethers, upgrades } = require('hardhat');

const main = async () => {
    const AdminSwapper = await ethers.getContractFactory('SwapperV1');
    const adminSwapper = await upgrades.deployProxy(AdminSwapper, [], {
        initializer: 'initialize'
    });
    await adminSwapper.deployed();
    console.log(`AdminSwapper deployed to: ${AdminSwapper.address}`);
};
main();
