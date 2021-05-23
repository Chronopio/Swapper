const { expect } = require('chai');
const erc20 = require('@studydefi/money-legos/erc20');
const axios = require('axios');

describe('Swapper contract', () => {
    let swapper, swapperV2, owner, addr1, daiContract, batContract;

    beforeEach(async () => {
        const SwapperV1 = await ethers.getContractFactory('SwapperV1');
        swapper = await upgrades.deployProxy(SwapperV1, []);
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
        zrxContract = new ethers.Contract(
            erc20.zrx.address,
            erc20.zrx.abi,
            owner
        );
    });

    describe('Swap', () => {
        it('should revert if user sends no money', async () => {
            await expect(
                swapper.internalSwapper(
                    ['0x6B175474E89094C44Da98b954EedeAC495271d0F'],
                    [100]
                )
            ).to.be.revertedWith('The amount is too low');
        });

        it('should swap ETH for DAI', async () => {
            const daiBalanceWeiStart = await daiContract.balanceOf(
                owner.address
            );
            const daiBalanceStart = ethers.utils.formatUnits(
                daiBalanceWeiStart,
                18
            );

            console.log('Swapper address:', swapper.address);

            await swapper.internalSwapper(
                ['0x6B175474E89094C44Da98b954EedeAC495271d0F'],
                [100],
                {
                    value: ethers.utils.parseEther('0.00001'),
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

            expect(daiBalanceEnd > daiBalanceStart).to.be.true;
        });

        it('should send fee to a recipient', async () => {
            const initialBalance = await ethers.provider.getBalance(
                owner.address
            );

            await swapper
                .connect(addr1)
                .internalSwapper(
                    ['0x6B175474E89094C44Da98b954EedeAC495271d0F'],
                    [100],
                    {
                        value: ethers.utils.parseEther('0.00001'),
                        gasLimit: 1000000
                    }
                );

            const finalBalance = await ethers.provider.getBalance(
                owner.address
            );

            console.log('Initial owner balance', initialBalance.toString());
            console.log('Final owner balance', finalBalance.toString());

            expect(finalBalance.gt(initialBalance)).to.be.true;
        });

        it('should be able to split the swaps into several tokens', async () => {
            const daiBalanceWeiStart = await daiContract.balanceOf(
                owner.address
            );
            const daiBalanceStart = ethers.utils.formatUnits(
                daiBalanceWeiStart,
                18
            );
            const batBalanceWeiStart = await batContract.balanceOf(
                owner.address
            );
            const batBalanceStart = ethers.utils.formatUnits(
                batBalanceWeiStart,
                18
            );
            const zrxBalanceWeiStart = await zrxContract.balanceOf(
                owner.address
            );
            const zrxBalanceStart = ethers.utils.formatUnits(
                zrxBalanceWeiStart,
                18
            );
            console.log(
                `BAT initial balance ${batBalanceStart}`,
                `DAI initial balance ${daiBalanceStart}`,
                `ZRX initial balance ${zrxBalanceStart}`
            );

            await swapper.internalSwapper(
                [
                    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                    '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
                    '0xE41d2489571d322189246DaFA5ebDe1F4699F498'
                ],
                [30, 30, 40],
                {
                    value: ethers.utils.parseEther('0.01'),
                    gasLimit: 1000000
                }
            );

            const batBalanceWeiEnd = await batContract.balanceOf(owner.address);
            const batBalanceEnd = ethers.utils.formatUnits(
                batBalanceWeiEnd,
                18
            );
            const daiBalanceWeiEnd = await daiContract.balanceOf(owner.address);
            const daiBalanceEnd = ethers.utils.formatUnits(
                daiBalanceWeiEnd,
                18
            );
            const zrxBalanceWeiEnd = await zrxContract.balanceOf(owner.address);
            const zrxBalanceEnd = ethers.utils.formatUnits(
                zrxBalanceWeiEnd,
                18
            );

            console.log(
                `BAT final balance ${batBalanceEnd}`,
                `DAI final balance ${daiBalanceEnd}`,
                `ZRX final balance ${zrxBalanceEnd}`
            );
            expect(daiBalanceEnd > daiBalanceStart).to.be.true;
            expect(batBalanceEnd > batBalanceStart).to.be.true;
            expect(zrxBalanceEnd > zrxBalanceStart).to.be.true;
        });

        it('should be able to upgrade the contract', async () => {
            const SwapperV2 = await ethers.getContractFactory('SwapperV2');

            console.log(swapper.address);

            swapperV2 = await upgrades.upgradeProxy(swapper.address, SwapperV2);

            console.log('Upgraded address:', swapperV2.address);
        });

        it('should swap in Uniswap in upgraded', async () => {
            const daiBalanceWeiStart = await daiContract.balanceOf(
                owner.address
            );
            const daiBalanceStart = ethers.utils.formatUnits(
                daiBalanceWeiStart,
                18
            );

            await swapperV2.internalSwapper(
                ['0x6B175474E89094C44Da98b954EedeAC495271d0F'],
                [100],
                [true],
                {
                    value: ethers.utils.parseEther('0.001'),
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

            expect(daiBalanceEnd > daiBalanceStart).to.be.true;
        });

        it('should swap in Balancer in upgraded', async () => {
            const daiBalanceWeiStart = await daiContract.balanceOf(
                owner.address
            );
            const daiBalanceStart = ethers.utils.formatUnits(
                daiBalanceWeiStart,
                18
            );

            await swapperV2.internalSwapper(
                ['0x6B175474E89094C44Da98b954EedeAC495271d0F'],
                [100],
                [false],
                {
                    value: ethers.utils.parseEther('0.001'),
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

            expect(daiBalanceEnd > daiBalanceStart).to.be.true;
        });

        it('should send a fee to a recipient in upgraded', async () => {
            const initialBalance = await ethers.provider.getBalance(
                owner.address
            );

            await swapperV2
                .connect(addr1)
                .internalSwapper(
                    ['0x6B175474E89094C44Da98b954EedeAC495271d0F'],
                    [100],
                    [true],
                    {
                        value: ethers.utils.parseEther('0.001'),
                        gasLimit: 1000000
                    }
                );

            const finalBalance = await ethers.provider.getBalance(
                owner.address
            );

            console.log('Initial owner balance', initialBalance.toString());
            console.log('Final owner balance', finalBalance.toString());

            expect(finalBalance.gt(initialBalance)).to.be.true;
        });

        it('should select the best DEX to swap and send a swap request there with 3 tokens in upgraded', async () => {
            const daiBalanceWeiStart = await daiContract.balanceOf(
                owner.address
            );
            const daiBalanceStart = ethers.utils.formatUnits(
                daiBalanceWeiStart,
                18
            );
            const batBalanceWeiStart = await batContract.balanceOf(
                owner.address
            );
            const batBalanceStart = ethers.utils.formatUnits(
                batBalanceWeiStart,
                18
            );
            const zrxBalanceWeiStart = await zrxContract.balanceOf(
                owner.address
            );
            const zrxBalanceStart = ethers.utils.formatUnits(
                zrxBalanceWeiStart,
                18
            );
            console.log(
                `BAT initial balance ${batBalanceStart}`,
                `DAI initial balance ${daiBalanceStart}`,
                `ZRX initial balance ${zrxBalanceStart}`
            );

            let tokensArray = [
                '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
                '0xE41d2489571d322189246DaFA5ebDe1F4699F498'
            ];
            let dexArray = [];
            let response;
            let isBetterUniswap;

            for (let i = 0; i < tokensArray.length; i++) {
                const fromToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
                const toToken = tokensArray[i];

                response = await axios.get(
                    `https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=${fromToken}&toTokenAddress=${toToken}&amount=${ethers.utils.parseEther(
                        '0.01'
                    )}&protocols=UNISWAP_V2,BALANCER,WETH`
                );

                console.log(response.data.protocols[0][1][0].name);

                isBetterUniswap =
                    response.data.protocols[0][1][0].name === 'UNISWAP_V2'
                        ? true
                        : false;

                dexArray.push(isBetterUniswap);
            }

            await swapperV2.internalSwapper(
                tokensArray,
                [30, 30, 40],
                dexArray,
                {
                    value: ethers.utils.parseEther('0.01'),
                    gasLimit: 1000000
                }
            );

            const batBalanceWeiEnd = await batContract.balanceOf(owner.address);
            const batBalanceEnd = ethers.utils.formatUnits(
                batBalanceWeiEnd,
                18
            );
            const daiBalanceWeiEnd = await daiContract.balanceOf(owner.address);
            const daiBalanceEnd = ethers.utils.formatUnits(
                daiBalanceWeiEnd,
                18
            );
            const zrxBalanceWeiEnd = await zrxContract.balanceOf(owner.address);
            const zrxBalanceEnd = ethers.utils.formatUnits(
                zrxBalanceWeiEnd,
                18
            );

            console.log(
                `BAT final balance ${batBalanceEnd}`,
                `DAI final balance ${daiBalanceEnd}`,
                `ZRX final balance ${zrxBalanceEnd}`
            );

            expect(daiBalanceEnd > daiBalanceStart).to.be.true;
            expect(batBalanceEnd > batBalanceStart).to.be.true;
            expect(zrxBalanceEnd > zrxBalanceStart).to.be.true;
        });
    });
});
