// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Tempo Pirate (TPirate)
/// @notice TIP-20 token on Tempo Chain mainnet — 6 decimals mandatory
contract TempoPirate is ERC20, ERC20Burnable, Ownable {
    /// @notice Hard cap of 1 billion TPirate (6 decimals)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e6;

    /// @notice Amount minted per public faucet call: 1,000 TPirate
    uint256 public constant MINT_AMOUNT = 1_000 * 1e6;

    /// @notice Time between public mint calls per address: 24 hours
    uint256 public constant MINT_COOLDOWN = 24 hours;

    /// @notice Tracks last publicMint timestamp per address
    mapping(address => uint256) public lastMintTime;

    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("Tempo Pirate", "TPirate") Ownable(msg.sender) {
        uint256 initialSupply = 100_000_000 * 1e6;
        _mint(msg.sender, initialSupply);
        emit TokensMinted(msg.sender, initialSupply);
    }

    /// @notice TIP-20 requires 6 decimals — overrides ERC20 default of 18
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Public faucet — mints 1,000 TPirate to caller with 24-hour cooldown
    function publicMint() external {
        uint256 last = lastMintTime[msg.sender];
        require(
            last == 0 || block.timestamp >= last + MINT_COOLDOWN,
            "Cooldown active"
        );
        require(totalSupply() + MINT_AMOUNT <= MAX_SUPPLY, "Max supply reached");
        lastMintTime[msg.sender] = block.timestamp;
        _mint(msg.sender, MINT_AMOUNT);
        emit TokensMinted(msg.sender, MINT_AMOUNT);
    }

    /// @notice Owner can mint any amount up to MAX_SUPPLY
    /// @param to Recipient address
    /// @param amount Raw token amount (6 decimals)
    function ownerMint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /// @notice Override burn to emit TokensBurned event
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /// @notice Override burnFrom to emit TokensBurned event
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
}
