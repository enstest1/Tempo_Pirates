// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/TempoPirate.sol";

contract FundWhaleFaucetScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        address tpirate = 0x8753bB308BCb6972D298c03f997d10CcE781D65D;
        address whaleFaucet = 0x59B092F23fdcF0fcd8b08f73172b685E708509Db;
        uint256 amount = 1_000_000 * 1e6; // 1M TPirate

        vm.startBroadcast(privateKey);

        TempoPirate(tpirate).ownerMint(whaleFaucet, amount);

        vm.stopBroadcast();

        console.log("=== Whale Faucet Funded ===");
        console.log("Minted 1,000,000 TPirate to WhaleFaucet");
        console.log("WhaleFaucet:", whaleFaucet);
    }
}
