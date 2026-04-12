// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Whale Faucet for TPirate
/// @notice Holders of the Stable Whale NFT can claim 10,000 TPirate every 12 hours
contract WhaleFaucet is Ownable {
    IERC20 public immutable tpirate;
    IERC721 public immutable whaleNFT;

    uint256 public claimAmount = 10_000 * 1e6; // 10,000 TPirate (6 decimals)
    uint256 public cooldown = 12 hours;

    mapping(address => uint256) public lastClaimTime;

    event WhaleClaimed(address indexed whale, uint256 amount);
    event ClaimAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event CooldownUpdated(uint256 oldCooldown, uint256 newCooldown);
    event FundsWithdrawn(address indexed to, uint256 amount);

    constructor(address _tpirate, address _whaleNFT) Ownable(msg.sender) {
        tpirate = IERC20(_tpirate);
        whaleNFT = IERC721(_whaleNFT);
    }

    /// @notice Claim TPirate — must hold at least 1 Stable Whale NFT
    function whaleClaim() external {
        require(whaleNFT.balanceOf(msg.sender) > 0, "Must hold a Stable Whale NFT");

        uint256 last = lastClaimTime[msg.sender];
        require(
            last == 0 || block.timestamp >= last + cooldown,
            "Cooldown active"
        );
        require(
            tpirate.balanceOf(address(this)) >= claimAmount,
            "Faucet empty - check back later"
        );

        lastClaimTime[msg.sender] = block.timestamp;
        tpirate.transfer(msg.sender, claimAmount);
        emit WhaleClaimed(msg.sender, claimAmount);
    }

    /// @notice Check how many seconds until caller can claim again
    function timeUntilClaim(address user) external view returns (uint256) {
        uint256 last = lastClaimTime[user];
        if (last == 0) return 0;
        uint256 elapsed = block.timestamp - last;
        if (elapsed >= cooldown) return 0;
        return cooldown - elapsed;
    }

    /// @notice Remaining TPirate balance in this faucet
    function faucetBalance() external view returns (uint256) {
        return tpirate.balanceOf(address(this));
    }

    // ── Owner functions ──

    function setClaimAmount(uint256 _amount) external onlyOwner {
        emit ClaimAmountUpdated(claimAmount, _amount);
        claimAmount = _amount;
    }

    function setCooldown(uint256 _cooldown) external onlyOwner {
        emit CooldownUpdated(cooldown, _cooldown);
        cooldown = _cooldown;
    }

    function withdraw(uint256 _amount) external onlyOwner {
        tpirate.transfer(msg.sender, _amount);
        emit FundsWithdrawn(msg.sender, _amount);
    }

    function withdrawAll() external onlyOwner {
        uint256 bal = tpirate.balanceOf(address(this));
        tpirate.transfer(msg.sender, bal);
        emit FundsWithdrawn(msg.sender, bal);
    }
}
