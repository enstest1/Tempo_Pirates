// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/TempoPirate.sol";

contract TempoPirateTest is Test {
    TempoPirate public token;

    address public owner;
    address public alice;
    address public bob;

    uint256 constant INITIAL_SUPPLY  = 100_000_000 * 1e6;
    uint256 constant MAX_SUPPLY      = 1_000_000_000 * 1e6;
    uint256 constant MINT_AMOUNT     = 1_000 * 1e6;
    uint256 constant MINT_COOLDOWN   = 86400; // 24 hours in seconds

    function setUp() public {
        owner = address(this);
        alice = makeAddr("alice");
        bob   = makeAddr("bob");
        token = new TempoPirate();
    }

    // ─── Deployment ────────────────────────────────────────────────────────────

    function test_Deploy_Name() public view {
        assertEq(token.name(), "Tempo Pirate");
    }

    function test_Deploy_Symbol() public view {
        assertEq(token.symbol(), "TPirate");
    }

    function test_Deploy_Decimals() public view {
        assertEq(token.decimals(), 6);
    }

    function test_Deploy_DeployerReceivesInitialSupply() public view {
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
    }

    function test_Deploy_TotalSupplyEqualsInitialMint() public view {
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
    }

    function test_Deploy_MaxSupplyConstant() public view {
        assertEq(token.MAX_SUPPLY(), MAX_SUPPLY);
    }

    // ─── publicMint ────────────────────────────────────────────────────────────

    function test_PublicMint_MintsCorrectAmount() public {
        vm.prank(alice);
        token.publicMint();
        assertEq(token.balanceOf(alice), MINT_AMOUNT);
    }

    function test_PublicMint_IncreasesTotalSupply() public {
        uint256 supplyBefore = token.totalSupply();
        vm.prank(alice);
        token.publicMint();
        assertEq(token.totalSupply(), supplyBefore + MINT_AMOUNT);
    }

    function test_PublicMint_SetsLastMintTime() public {
        uint256 ts = block.timestamp;
        vm.prank(alice);
        token.publicMint();
        assertEq(token.lastMintTime(alice), ts);
    }

    function test_PublicMint_RevertsWithCooldownActiveIfCalledAgain() public {
        vm.startPrank(alice);
        token.publicMint();
        vm.expectRevert("Cooldown active");
        token.publicMint();
        vm.stopPrank();
    }

    function test_PublicMint_RevertsIfCalledJustBeforeCooldownExpires() public {
        vm.startPrank(alice);
        token.publicMint();
        vm.warp(block.timestamp + MINT_COOLDOWN - 1);
        vm.expectRevert("Cooldown active");
        token.publicMint();
        vm.stopPrank();
    }

    function test_PublicMint_SucceedsAfterCooldownExpires() public {
        vm.startPrank(alice);
        token.publicMint();
        vm.warp(block.timestamp + 86401);
        token.publicMint();
        vm.stopPrank();
        assertEq(token.balanceOf(alice), MINT_AMOUNT * 2);
    }

    function test_PublicMint_DifferentAddressesIndependentCooldown() public {
        vm.prank(alice);
        token.publicMint();

        // Bob can still mint immediately
        vm.prank(bob);
        token.publicMint();

        assertEq(token.balanceOf(alice), MINT_AMOUNT);
        assertEq(token.balanceOf(bob),   MINT_AMOUNT);
    }

    // ─── ownerMint ─────────────────────────────────────────────────────────────

    function test_OwnerMint_Works() public {
        token.ownerMint(bob, 5_000 * 1e6);
        assertEq(token.balanceOf(bob), 5_000 * 1e6);
    }

    function test_OwnerMint_IncreasesTotalSupply() public {
        uint256 supplyBefore = token.totalSupply();
        token.ownerMint(bob, 5_000 * 1e6);
        assertEq(token.totalSupply(), supplyBefore + 5_000 * 1e6);
    }

    function test_OwnerMint_RevertsForNonOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        token.ownerMint(alice, 5_000 * 1e6);
    }

    function test_OwnerMint_RevertsIfExceedsMaxSupply() public {
        uint256 remaining = token.MAX_SUPPLY() - token.totalSupply();
        vm.expectRevert("Exceeds max supply");
        token.ownerMint(owner, remaining + 1);
    }

    function test_OwnerMint_SucceedsUpToExactMaxSupply() public {
        uint256 remaining = token.MAX_SUPPLY() - token.totalSupply();
        token.ownerMint(owner, remaining);
        assertEq(token.totalSupply(), MAX_SUPPLY);
    }

    // ─── burn ──────────────────────────────────────────────────────────────────

    function test_Burn_ReducesTotalSupply() public {
        uint256 supplyBefore = token.totalSupply();
        uint256 burnAmount   = 1_000 * 1e6;
        token.burn(burnAmount);
        assertEq(token.totalSupply(), supplyBefore - burnAmount);
    }

    function test_Burn_ReducesCallerBalance() public {
        uint256 balBefore  = token.balanceOf(owner);
        uint256 burnAmount = 1_000 * 1e6;
        token.burn(burnAmount);
        assertEq(token.balanceOf(owner), balBefore - burnAmount);
    }

    function test_BurnFrom_Works() public {
        token.transfer(alice, 5_000 * 1e6);
        vm.prank(alice);
        token.approve(owner, 2_000 * 1e6);
        token.burnFrom(alice, 2_000 * 1e6);
        assertEq(token.balanceOf(alice), 3_000 * 1e6);
    }
}
