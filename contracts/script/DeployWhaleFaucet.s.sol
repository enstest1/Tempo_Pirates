// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/WhaleFaucet.sol";

contract DeployWhaleFaucetScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(privateKey);

        address tpirate = 0x8753bB308BCb6972D298c03f997d10CcE781D65D;
        address whaleNFT = 0x3e12fcb20AD532f653F2907d2aE511364e2ae696;

        vm.startBroadcast(privateKey);

        WhaleFaucet faucet = new WhaleFaucet(tpirate, whaleNFT);

        vm.stopBroadcast();

        console.log("=== Whale Faucet Deployment ===");
        console.log("Network:     Tempo Mainnet (Chain ID 4217)");
        console.log("Deployer:    ", deployer);
        console.log("WhaleFaucet: ", address(faucet));
        console.log("TPirate:     ", tpirate);
        console.log("Whale NFT:   ", whaleNFT);
        console.log("Claim:       10,000 TPirate per 12h");

        string memory json = string(
            abi.encodePacked(
                '{"WhaleFaucet": "', vm.toString(address(faucet)),
                '", "TPirate": "', vm.toString(tpirate),
                '", "WhaleNFT": "', vm.toString(whaleNFT),
                '"}'
            )
        );
        vm.writeFile("deployments/whale-faucet.json", json);
        console.log("Address written to deployments/whale-faucet.json");
    }
}
