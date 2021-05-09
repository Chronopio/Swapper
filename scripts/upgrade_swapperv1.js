const { ethers, upgrades } = require('hardhat');

const main = async () => {
    const SwapperV2 = await ethers.getContractFactory('SwapperV2');
    console.log('Upgrading Swapper...');
    const swapper = await upgrades.upgradeProxy(
        '/* Here must be the address of the proxy */',
        SwapperV2
    );
    console.log('Swapper upgraded');
};
main();
