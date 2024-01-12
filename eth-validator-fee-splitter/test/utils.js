function evmPrefundAddress(account, balanceInWei) {
    const balanceInHex = web3.utils.toHex(balanceInWei);
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_setAccountBalance',
            params: [account, balanceInHex],
            id: new Date().getTime()
        }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = evmPrefundAddress