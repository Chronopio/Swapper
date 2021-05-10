// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

interface BalancerInterface {
    function smartSwapExactIn(
        TokenInterface tokenIn,
        TokenInterface tokenOut,
        uint256 totalAmountIn,
        uint256 minTotalAmountOut,
        uint256 nPools
    ) external payable returns (uint256 totalAmountOut);
}

interface TokenInterface {
    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    function approve(address, uint256) external returns (bool);

    function transfer(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function deposit() external payable;

    function withdraw(uint256) external;
}

contract SwapperV2 is Initializable {
    address public constant uniswapRouterAddress =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant feeRecipient =
        0xD215De1fc9E2514Cf274df3F2378597C7Be06Aca;
    address public constant balancerRouterAddress =
        0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21;

    function initialize() public initializer {}

    function internalSwapper(
        address[] memory _token,
        uint256[] memory proportion,
        bool[] memory isBetterUniswap
    ) external payable {
        require(msg.value > 0, "You can't trade if you don't send money");
        require(
            _token.length == proportion.length,
            "You must set a proportion for each token"
        );
        require(
            _token.length == isBetterUniswap.length,
            "You must set a proportion for each token"
        );
        require(
            (msg.value / 10000) * 10000 == msg.value,
            "The amount is too low"
        );

        uint256 arrayLength = _token.length;

        for (uint256 i = 0; i < arrayLength; i++) {

            uint256 sentAmount = (msg.value * (proportion[i] * 100)) / 10000;
            uint256 fee = sentAmount / 10000;
            uint256 amountToSend = sentAmount - fee;

            payable(feeRecipient).transfer(fee);

            if (isBetterUniswap[i] == true) {
                address[] memory _path = new address[](2);

                _path[0] = IUniswapV2Router02(uniswapRouterAddress).WETH();
                _path[1] = _token[i];

                IUniswapV2Router02(uniswapRouterAddress).swapExactETHForTokens{
                    value: amountToSend
                }(1, _path, msg.sender, block.timestamp + 300);
            } else {
                TokenInterface tokenOut = TokenInterface(_token[i]);

                BalancerInterface(balancerRouterAddress).smartSwapExactIn{
                    value: amountToSend
                }(
                    TokenInterface(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE),
                    TokenInterface(_token[i]),
                    amountToSend,
                    1,
                    1
                );
                tokenOut.transfer(msg.sender, tokenOut.balanceOf(address(this)));
            }
        }
    }
}
