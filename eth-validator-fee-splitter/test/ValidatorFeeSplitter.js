const ValidatorFeeSplitter = artifacts.require("ValidatorFeeSplitter");
const evmPrefundAddress = require("./utils.js")

contract("ValidatorFeeSplitter", (accounts) => {
    const withdrawalAddress = accounts[1];
    const operatorAddress = accounts[2];

    // This function prefunds the address with ETH. In the production case prefunding will be done through block production rewards

    async function assertDistribution(validatorFeeSplitter, expectedToReceivedToWithdrawalAddress, expectedToReceiveToOperatorAddress) {
        const balanceBeforeWithdraw = await web3.eth.getBalance(withdrawalAddress);
        const balanceBeforeOperator = await web3.eth.getBalance(operatorAddress);

        await validatorFeeSplitter.distributeBalance();

        const balanceAfterWithdraw = await web3.eth.getBalance(withdrawalAddress);
        const balanceAfterOperator = await web3.eth.getBalance(operatorAddress);

        const withdrawBalanceChange = new web3.utils.BN(balanceAfterWithdraw).sub(new web3.utils.BN(balanceBeforeWithdraw));
        const operatorBalanceChange = new web3.utils.BN(balanceAfterOperator).sub(new web3.utils.BN(balanceBeforeOperator));

        assert.isTrue(withdrawBalanceChange.eq(new web3.utils.BN(expectedToReceivedToWithdrawalAddress)), "Incorrect balance distributed to withdraw address");
        assert.isTrue(operatorBalanceChange.eq(new web3.utils.BN(expectedToReceiveToOperatorAddress)), "Incorrect balance distributed to operator address");
    }

    async function assertDistributionUponTransaction(validatorFeeSplitter, expectedToReceivedToWithdrawalAddress, expectedToReceiveToOperatorAddress, depositAmount) {
        const balanceBeforeWithdraw = await web3.eth.getBalance(withdrawalAddress);
        const balanceBeforeOperator = await web3.eth.getBalance(operatorAddress);

        await web3.eth.sendTransaction({to: validatorFeeSplitter.address, from: accounts[0], value: depositAmount});

        const balanceAfterWithdraw = await web3.eth.getBalance(withdrawalAddress);
        const balanceAfterOperator = await web3.eth.getBalance(operatorAddress);

        const withdrawBalanceChange = new web3.utils.BN(balanceAfterWithdraw).sub(new web3.utils.BN(balanceBeforeWithdraw));
        const operatorBalanceChange = new web3.utils.BN(balanceAfterOperator).sub(new web3.utils.BN(balanceBeforeOperator));

        assert.isTrue(withdrawBalanceChange.eq(new web3.utils.BN(expectedToReceivedToWithdrawalAddress)), "Incorrect balance distributed to withdraw address");
        assert.isTrue(operatorBalanceChange.eq(new web3.utils.BN(expectedToReceiveToOperatorAddress)), "Incorrect balance distributed to operator address");
    }

    it("should distribute small balance", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitter.new(withdrawalAddress, operatorAddress);
        await evmPrefundAddress(validatorFeeSplitter.address, "1");
        await assertDistribution(validatorFeeSplitter, "1", "0");
        await evmPrefundAddress(validatorFeeSplitter.address, "3");
        await assertDistribution(validatorFeeSplitter, "3", "0");
        await evmPrefundAddress(validatorFeeSplitter.address, "4");
        await assertDistribution(validatorFeeSplitter, "3", "1");
    })

    it("should distribute prefunded balance", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitter.new(withdrawalAddress, operatorAddress);
        await evmPrefundAddress(validatorFeeSplitter.address, "100");
        await assertDistribution(validatorFeeSplitter, "70", "30");
    })

    it("should distribute balance on receiving ether", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitter.new(withdrawalAddress, operatorAddress);
        await evmPrefundAddress(validatorFeeSplitter.address, "100");
        await assertDistributionUponTransaction(validatorFeeSplitter, "140", "60", "100");
        //second transaction has no balance impact as it was already distributed
        await assertDistributionUponTransaction(validatorFeeSplitter, "70", "30", "100");
    });

    it("should not distribute balance when distributeBalance is called on zero balance", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitter.new(withdrawalAddress, operatorAddress);
        try {
            await validatorFeeSplitter.distributeBalance();
            assert.fail("The transaction should have thrown an error");
        } catch (err) {
            assert.include(err.message, "No balance to distribute", "The error message is not correct");
        }
    });

    it("should not use more than 360000 gas for a deployment", async () => {
        const result = await ValidatorFeeSplitter.new(withdrawalAddress, operatorAddress);
        const receipt = await web3.eth.getTransactionReceipt(result.transactionHash);
        const gasUsed = receipt.gasUsed;
        assert.isBelow(gasUsed, 360000, "Gas used is too high!");
    });

    it("should not use more than 42000 gas to distribute balance upon transaction", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitter.new(withdrawalAddress, operatorAddress);
        const receipt = await web3.eth.sendTransaction({
            to: validatorFeeSplitter.address,
            from: accounts[0],
            value: "1000"
        });
        const gasUsed = receipt.gasUsed;
        assert.isBelow(gasUsed, 42000, "Gas used is too high!");
    });

    it("should not use more than 41500 gas to distribute balance", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitter.new(withdrawalAddress, operatorAddress);
        await evmPrefundAddress(validatorFeeSplitter.address, "1000");
        const tx = await validatorFeeSplitter.distributeBalance();
        const gasUsed = tx.receipt.gasUsed;
        assert.isBelow(gasUsed, 41500, "Gas used is too high!");
    });
});
