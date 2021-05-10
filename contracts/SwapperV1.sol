// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

/*  Proxies are completely oblivious to the existence of constructors. So we use initializer functions. OZ provides a contract for that */
contract SwapperV1 is Initializable {
    // Avoiding initial values in field declarations. Constant state variables are still allowed and saves gas.
    address private constant uniswapRouterAddress =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant feeRecipient =
        0xD215De1fc9E2514Cf274df3F2378597C7Be06Aca;

    function initialize() public initializer {}

    function internalSwapper(
        address[] memory _token,
        uint256[] memory proportion
    ) external payable {
        require(
            _token.length == proportion.length,
            "You must set a proportion for each token"
        );
        require(
            msg.value > 0 && (msg.value / 10000) * 10000 == msg.value,
            "The amount is too low"
        );

        address[] memory _path = new address[](2);
        uint256 arrayLength = _token.length;

        for (uint256 i = 0; i < arrayLength; i++) {
            uint256 amountToSend = (msg.value * (proportion[i] * 100)) / 10000;
            uint256 fee = amountToSend / 10000;

            _path[0] = IUniswapV2Router02(uniswapRouterAddress).WETH();
            _path[1] = _token[i];

            payable(feeRecipient).transfer(fee);

            IUniswapV2Router02(uniswapRouterAddress).swapExactETHForTokens{
                value: amountToSend - fee
            }(1, _path, msg.sender, block.timestamp + 300);
        }
    }
}
