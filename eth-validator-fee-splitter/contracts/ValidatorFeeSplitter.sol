// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2024 Brick Towers <support@bricktowers.io>
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

contract ValidatorFeeSplitter {
    using Address for address payable;

    address payable public immutable withdrawalAddress;
    address payable public immutable operatorAddress;

    constructor(
        address payable withdrawalAddress_,
        address payable operatorAddress_
    ) {
        withdrawalAddress = withdrawalAddress_;
        operatorAddress = operatorAddress_;
    }

    function distributeBalance() public {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to distribute");

        uint256 amountToOperator = balance * 30 / 100;
        uint256 amountToWithdraw = balance - amountToOperator;

        // Transfer the amounts
        withdrawalAddress.sendValue(amountToWithdraw);
        operatorAddress.sendValue(amountToOperator);
    }

    receive() external payable {
        distributeBalance();
    }
}