// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";

// PRICE = INITIAL_USDC / INITIAL_TPIRATE
// Example: 10_000_000 USDC units / 1_000_000_000_000 TPirate units
//        = $0.00001 per TPirate
// To set higher price: use fewer TPirate with same USDC
// You control the launch price by choosing this ratio

interface IERC20Minimal {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IUniswapV2Router02 {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    function factory() external pure returns (address);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

contract AddLiquidityScript is Script {
    function run() external {
        uint256 privateKey     = vm.envUint("PRIVATE_KEY");
        address tpirateAddress = vm.envAddress("TPIRATE_ADDRESS");
        address usdcAddress    = vm.envAddress("USDC_ADDRESS");      // TODO: confirm from docs.tempo.xyz
        address routerAddress  = vm.envAddress("UNISWAP_V2_ROUTER"); // TODO: confirm from Uniswap docs (Tempo deployment)
        uint256 initialTPirate = vm.envUint("INITIAL_TPIRATE");
        uint256 initialUsdc    = vm.envUint("INITIAL_USDC");

        address deployer = vm.addr(privateKey);

        console.log("=== AddLiquidity: TPirate / USDC ===");
        console.log("TPirate address:  ", tpirateAddress);
        console.log("USDC address:     ", usdcAddress);
        console.log("Router address:   ", routerAddress);
        console.log("TPirate amount:   ", initialTPirate);
        console.log("USDC amount:      ", initialUsdc);

        vm.startBroadcast(privateKey);

        // Step 1 — Approve Uniswap router to spend TPirate
        IERC20Minimal(tpirateAddress).approve(routerAddress, initialTPirate);

        // Step 2 — Approve Uniswap router to spend USDC
        IERC20Minimal(usdcAddress).approve(routerAddress, initialUsdc);

        // Step 3 — Add liquidity to create TPirate/USDC pair
        IUniswapV2Router02 router = IUniswapV2Router02(routerAddress);
        (uint256 amountA, uint256 amountB, uint256 liquidity) = router.addLiquidity(
            tpirateAddress,
            usdcAddress,
            initialTPirate,
            initialUsdc,
            0,
            0,
            deployer,
            block.timestamp + 300
        );

        vm.stopBroadcast();

        // Step 4 — Log pair address and LP tokens received
        address factory = router.factory();
        address pair    = IUniswapV2Factory(factory).getPair(tpirateAddress, usdcAddress);

        console.log("=== Liquidity Added ===");
        console.log("Pair address:       ", pair);
        console.log("LP tokens received: ", liquidity);
        console.log("TPirate deposited:  ", amountA);
        console.log("USDC deposited:     ", amountB);
        console.log("Effective price:    USDC_amount / TPirate_amount");
    }
}
