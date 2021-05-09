/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('dotenv').config();
require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');
require('hardhat-gas-reporter');
require('hardhat-etherscan-abi');
require('hardhat-log-remover');
require('@openzeppelin/hardhat-upgrades');
require('hardhat-deploy');
require('@nomiclabs/hardhat-ethers');

module.exports = {
    networks: {
        hardhat: {
            // Uncomment these lines to use mainnet fork
            accounts: {
                mnemonic: process.env.MNEMONIC,
                count: 10,
                accountsBalance: '10000000000000000000000'
            },
            forking: {
                url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
                blockNumber: 11589707
            }
        },
        live: {
            url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
            accounts: [process.env.MAINNET_PRIVKEY]
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API
    },
    solidity: {
        version: '0.8.4',
        settings: {
            optimizer: {
                enabled: false,
                runs: 200
            }
        }
    },
    namedAccounts: {
        deployer: 0,
        tokenOwner: 1
    },
    mocha: {
        timeout: 240000
    }
};
