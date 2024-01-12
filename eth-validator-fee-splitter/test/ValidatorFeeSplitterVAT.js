const ValidatorFeeSplitterVAT = artifacts.require("ValidatorFeeSplitterVAT");
const evmPrefundAddress = require("./utils.js")

contract("ValidatorFeeSplitterVAT", (accounts) => {
    const withdrawalAddress = accounts[1];
    const operatorAddress = accounts[2];
    const operatorVATAddress = accounts[3];

    // This function prefunds the address with ETH. In the production case prefunding will be done through block production rewards

    async function assertDistribution(validatorFeeSplitter, expectedToReceivedToWithdrawal, expectedToReceiveToOperator, expectedToReceiveToVAT) {
        const balanceBeforeWithdraw = await web3.eth.getBalance(withdrawalAddress);
        const balanceBeforeOperator = await web3.eth.getBalance(operatorAddress);
        const balanceBeforeVAT = await web3.eth.getBalance(operatorVATAddress);

        await validatorFeeSplitter.distributeBalance();

        const balanceAfterWithdraw = await web3.eth.getBalance(withdrawalAddress);
        const balanceAfterOperator = await web3.eth.getBalance(operatorAddress);
        const balanceAfterVAT = await web3.eth.getBalance(operatorVATAddress);

        const withdrawBalanceChange = new web3.utils.BN(balanceAfterWithdraw).sub(new web3.utils.BN(balanceBeforeWithdraw));
        const operatorBalanceChange = new web3.utils.BN(balanceAfterOperator).sub(new web3.utils.BN(balanceBeforeOperator));
        const VATBalanceChange = new web3.utils.BN(balanceAfterVAT).sub(new web3.utils.BN(balanceBeforeVAT));

        assert.isTrue(withdrawBalanceChange.eq(new web3.utils.BN(expectedToReceivedToWithdrawal)), "Incorrect balance distributed to withdraw address");
        assert.isTrue(operatorBalanceChange.eq(new web3.utils.BN(expectedToReceiveToOperator)), "Incorrect balance distributed to operator address");
        assert.isTrue(VATBalanceChange.eq(new web3.utils.BN(expectedToReceiveToVAT)), "Incorrect balance distributed to VAT address");
    }

    async function assertDistributionUponTransaction(validatorFeeSplitter, expectedToReceivedToWithdrawalAddress, expectedToReceiveToOperatorAddress, expectedToReceiveToVAT, depositAmount) {
        const balanceBeforeWithdraw = await web3.eth.getBalance(withdrawalAddress);
        const balanceBeforeOperator = await web3.eth.getBalance(operatorAddress);
        const balanceBeforeVAT = await web3.eth.getBalance(operatorVATAddress);

        await web3.eth.sendTransaction({to: validatorFeeSplitter.address, from: accounts[0], value: depositAmount});

        const balanceAfterWithdraw = await web3.eth.getBalance(withdrawalAddress);
        const balanceAfterOperator = await web3.eth.getBalance(operatorAddress);
        const balanceAfterVAT = await web3.eth.getBalance(operatorVATAddress);

        const withdrawBalanceChange = new web3.utils.BN(balanceAfterWithdraw).sub(new web3.utils.BN(balanceBeforeWithdraw));
        const operatorBalanceChange = new web3.utils.BN(balanceAfterOperator).sub(new web3.utils.BN(balanceBeforeOperator));
        const VATBalanceChange = new web3.utils.BN(balanceAfterVAT).sub(new web3.utils.BN(balanceBeforeVAT));

        assert.isTrue(withdrawBalanceChange.eq(new web3.utils.BN(expectedToReceivedToWithdrawalAddress)), "Incorrect balance distributed to withdraw address");
        assert.isTrue(operatorBalanceChange.eq(new web3.utils.BN(expectedToReceiveToOperatorAddress)), "Incorrect balance distributed to operator address");
        assert.isTrue(VATBalanceChange.eq(new web3.utils.BN(expectedToReceiveToVAT)), "Incorrect balance distributed to VAT address");
    }

    it("should distribute small balance", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitterVAT.new(withdrawalAddress, operatorAddress, operatorVATAddress);
        await evmPrefundAddress(validatorFeeSplitter.address, "1");
        await assertDistribution(validatorFeeSplitter, "1", "0", "0");
        await evmPrefundAddress(validatorFeeSplitter.address, "3");
        await assertDistribution(validatorFeeSplitter, "3", "0", "0");
        await evmPrefundAddress(validatorFeeSplitter.address, "4");
        await assertDistribution(validatorFeeSplitter, "3", "1", "0");
    })

    it("should distribute prefunded balance", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitterVAT.new(withdrawalAddress, operatorAddress, operatorVATAddress);
        await evmPrefundAddress(validatorFeeSplitter.address, "1000");
        await assertDistribution(validatorFeeSplitter, "676", "300", "24");
    })

    it("should distribute balance on receiving ether", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitterVAT.new(withdrawalAddress, operatorAddress, operatorVATAddress);
        await evmPrefundAddress(validatorFeeSplitter.address, "1000");
        await assertDistributionUponTransaction(validatorFeeSplitter, "1352", "600", "48", "1000");
        //second transaction has no balance impact as it was already distributed
        await assertDistributionUponTransaction(validatorFeeSplitter, "676", "300", "24", "1000");
    });

    it("should not distribute balance when distributeBalance is called on zero balance", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitterVAT.new(withdrawalAddress, operatorAddress, operatorVATAddress);
        try {
            await validatorFeeSplitter.distributeBalance();
            assert.fail("The transaction should have thrown an error");
        } catch (err) {
            assert.include(err.message, "No balance to distribute", "The error message is not correct");
        }
    });

    it("should not use more than 405000 gas for a deployment", async () => {
        const result = await ValidatorFeeSplitterVAT.new(withdrawalAddress, operatorAddress, operatorVATAddress);
        const receipt = await web3.eth.getTransactionReceipt(result.transactionHash);
        const gasUsed = receipt.gasUsed;
        assert.isBelow(gasUsed, 405000, "Gas used is too high!");
    });

    it("should not use more than 51500 gas to distribute balance upon transaction", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitterVAT.new(withdrawalAddress, operatorAddress, operatorVATAddress);
        const receipt = await web3.eth.sendTransaction({
            to: validatorFeeSplitter.address,
            from: accounts[0],
            value: "1000"
        });
        const gasUsed = receipt.gasUsed;
        assert.isBelow(gasUsed, 51500, "Gas used is too high!");
    });

    it("should not use more than 51600 gas to distribute balance", async () => {
        const validatorFeeSplitter = await ValidatorFeeSplitterVAT.new(withdrawalAddress, operatorAddress, operatorVATAddress);
        await evmPrefundAddress(validatorFeeSplitter.address, "1000");
        const tx = await validatorFeeSplitter.distributeBalance();
        const gasUsed = tx.receipt.gasUsed;
        assert.isBelow(gasUsed, 51600, "Gas used is too high!");
    });
});
