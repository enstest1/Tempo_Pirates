// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/TempoPirate.sol";

contract DeployScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(privateKey);

        vm.startBroadcast(privateKey);

        TempoPirate token = new TempoPirate();

        vm.stopBroadcast();

        console.log("=== Tempo Pirate (TPirate) Deployment ===");
        console.log("Network:   Tempo Mainnet (Chain ID 4217)");
        console.log("Deployer:  ", deployer);
        console.log("Contract:  ", address(token));
        console.log("Total supply after deploy:", token.totalSupply());

        // Write deployed address to deployments/mainnet.json
        string memory json = string(
            abi.encodePacked('{"TempoPirate": "', vm.toString(address(token)), '"}')
        );
        vm.writeFile("deployments/mainnet.json", json);
        console.log("Address written to deployments/mainnet.json");
    }
}
