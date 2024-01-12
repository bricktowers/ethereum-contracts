// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2024 Brick Towers <support@bricktowers.io>
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

contract ValidatorFeeSplitterVAT {
    using Address for address payable;

    address payable public immutable withdrawalAddress;
    address payable public immutable operatorAddress;
    address payable public immutable vatAddress;

    constructor(
        address payable withdrawalAddress_,
        address payable operatorAddress_,
        address payable vatAddress_
    ) {
        withdrawalAddress = withdrawalAddress_;
        operatorAddress = operatorAddress_;
        vatAddress = vatAddress_;
    }

    function distributeBalance() public {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to distribute");

        // Calculate the split
        uint256 amountToOperator = balance * 30 / 100;
        uint256 amountToVat = amountToOperator * 81 / 1000;
        uint256 amountToWithdraw = balance - amountToOperator - amountToVat;

        // Transfer the amounts
        withdrawalAddress.sendValue(amountToWithdraw);
        vatAddress.sendValue(amountToVat);
        operatorAddress.sendValue(amountToOperator);
    }

    receive() external payable {
        distributeBalance();
    }
}