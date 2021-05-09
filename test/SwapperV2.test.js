const { expect } = require('chai');
const erc20 = require('@studydefi/money-legos/erc20');

describe('Swapper upgrade', () => {
    let Swapper, swapper, owner, addr1, daiContract, batContract;

    beforeEach(async () => {
        Swapper = await ethers.getContractFactory('SwapperV2');
        swapper = await Swapper.deploy();
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        daiContract = new ethers.Contract(
            erc20.dai.address,
            erc20.dai.abi,
            owner
        );
        batContract = new ethers.Contract(
            erc20.bat.address,
            erc20.bat.abi,
            owner
        );
    });

    describe('Swap', () => {
        it('should swap in Balancer', async () => {
            const daiBalanceWeiStart = await daiContract.balanceOf(
                owner.address
            );
            const daiBalanceStart = ethers.utils.formatUnits(
                daiBalanceWeiStart,
                18
            );

            console.log('Swapper address:', swapper.address);

            await swapper.internalSwapperBalancer(
                '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                {
                    value: ethers.utils.parseEther('0.0001'),
                    gasLimit: 1000000
                }
            );

            const daiBalanceWeiEnd = await daiContract.balanceOf(owner.address);
            const daiBalanceEnd = ethers.utils.formatUnits(
                daiBalanceWeiEnd,
                18
            );

            console.log(
                `DAI starter balance ${daiBalanceStart}`,
                `DAI final balance ${daiBalanceEnd}`
            );
        });
    });
});
