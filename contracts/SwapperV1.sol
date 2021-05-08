// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

/*  Proxies are completely oblivious to the existence of constructors. So we use initializer functions. OZ provides a contract for that */
contract SwapperV1 is Initializable {
    // Avoiding initial values in field declarations. Constant state variables are still allowed and saves gas.
    address public constant uniswapRouterAddress =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    function initialize() public initializer {}

    function test() external payable returns (address) {
        return IUniswapV2Router02(uniswapRouterAddress).factory();
    }

    function internalSwapper(address _token) public payable {
        require(msg.value != 0, "You can't trade if you don't send money");

        address[] memory _path = new address[](2);

        _path[0] = IUniswapV2Router02(uniswapRouterAddress).WETH();
        _path[1] = _token;

        IUniswapV2Router02(uniswapRouterAddress).swapETHForExactTokens{
            value: msg.value
        }(1, _path, msg.sender, block.timestamp + 300);
    }
}
