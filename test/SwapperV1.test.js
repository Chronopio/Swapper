const { expect } = require('chai');

describe('Swapper contract', () => {
    let Swapper, swapper, owner, addr1, addr2;
    const provider = ethers.getDefaultProvider('http://localhost:8545');

    beforeEach(async () => {
        Swapper = await ethers.getContractFactory('SwapperV1');
        swapper = await Swapper.deploy();
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        console.log(owner, addr1, addr2);
    });

    describe('Swap', () => {
        it('should revert if user sends no money', async () => {
            await expect(
                swapper.internalSwapper(
                    '0x6B175474E89094C44Da98b954EedeAC495271d0F'
                )
            ).to.be.revertedWith("You can't trade if you don't send money");
        });

        it('should send ether', async () => {
            const initialBalance = await provider.getBalance(owner.address);

            console.log('Swapper address:', swapper.address);

            await swapper
                .connect(addr1)
                .internalSwapper('0x6B175474E89094C44Da98b954EedeAC495271d0F', {
                    value: ethers.utils.parseEther('0.00001'),
                    gasLimit: 1000000
                });

            const finalBalance = await provider.getBalance(owner.address);

            console.log(
                `Initial owner balance ${initialBalance.toString()}`,
                `Final owner balance ${finalBalance.toString()}`
            );
        });
    });
});
