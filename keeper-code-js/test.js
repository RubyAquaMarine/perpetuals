const ethers = require('ethers');
const { maxHeaderSize } = require('http');

import BN from "bn.js";
import BigNumber from "bignumber.js";


abi = [{ "inputs": [{ "internalType": "uint256", "name": "_priceDuration", "type": "uint256" }, { "internalType": "uint256", "name": "_maxPriceUpdateDelay", "type": "uint256" }, { "internalType": "uint256", "name": "_minBlockInterval", "type": "uint256" }, { "internalType": "uint256", "name": "_maxDeviationBasisPoints", "type": "uint256" }, { "internalType": "address", "name": "_fastPriceEvents", "type": "address" }, { "internalType": "address", "name": "_tokenManager", "type": "address" }, { "internalType": "address", "name": "_positionRouter", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "DisableFastPrice", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "EnableFastPrice", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "refPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fastPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "cumulativeRefDelta", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "cumulativeFastDelta", "type": "uint256" }], "name": "MaxCumulativeDeltaDiffExceeded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "refPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fastPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "cumulativeRefDelta", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "cumulativeFastDelta", "type": "uint256" }], "name": "PriceData", "type": "event" }, { "inputs": [], "name": "BASIS_POINTS_DIVISOR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "BITMASK_32", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "CUMULATIVE_DELTA_PRECISION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_CUMULATIVE_FAST_DELTA", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_CUMULATIVE_REF_DELTA", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_PRICE_DURATION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_REF_PRICE", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PRICE_PRECISION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "disableFastPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "disableFastPriceVoteCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "disableFastPriceVotes", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "enableFastPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "fastPriceEvents", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }], "name": "favorFastPrice", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "_refPrice", "type": "uint256" }, { "internalType": "bool", "name": "_maximise", "type": "bool" }], "name": "getPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }], "name": "getPriceData", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "gov", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_minAuthorizations", "type": "uint256" }, { "internalType": "address[]", "name": "_signers", "type": "address[]" }, { "internalType": "address[]", "name": "_updaters", "type": "address[]" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "isInitialized", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isSigner", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isSpreadEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isUpdater", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastUpdatedAt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastUpdatedBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "maxCumulativeDeltaDiffs", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxDeviationBasisPoints", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxPriceUpdateDelay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxTimeDeviation", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minAuthorizations", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minBlockInterval", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "positionRouter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "priceData", "outputs": [{ "internalType": "uint160", "name": "refPrice", "type": "uint160" }, { "internalType": "uint32", "name": "refTime", "type": "uint32" }, { "internalType": "uint32", "name": "cumulativeRefDelta", "type": "uint32" }, { "internalType": "uint32", "name": "cumulativeFastDelta", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "priceDataInterval", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "priceDuration", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "prices", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "_priceBitArray", "type": "uint256[]" }, { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }], "name": "setCompactedPrices", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_fastPriceEvents", "type": "address" }], "name": "setFastPriceEvents", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_gov", "type": "address" }], "name": "setGov", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "_isSpreadEnabled", "type": "bool" }], "name": "setIsSpreadEnabled", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_lastUpdatedAt", "type": "uint256" }], "name": "setLastUpdatedAt", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "_tokens", "type": "address[]" }, { "internalType": "uint256[]", "name": "_maxCumulativeDeltaDiffs", "type": "uint256[]" }], "name": "setMaxCumulativeDeltaDiffs", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_maxDeviationBasisPoints", "type": "uint256" }], "name": "setMaxDeviationBasisPoints", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_maxPriceUpdateDelay", "type": "uint256" }], "name": "setMaxPriceUpdateDelay", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_maxTimeDeviation", "type": "uint256" }], "name": "setMaxTimeDeviation", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_minAuthorizations", "type": "uint256" }], "name": "setMinAuthorizations", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_minBlockInterval", "type": "uint256" }], "name": "setMinBlockInterval", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_priceDataInterval", "type": "uint256" }], "name": "setPriceDataInterval", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_priceDuration", "type": "uint256" }], "name": "setPriceDuration", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "_tokens", "type": "address[]" }, { "internalType": "uint256[]", "name": "_prices", "type": "uint256[]" }, { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }], "name": "setPrices", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_priceBits", "type": "uint256" }, { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }], "name": "setPricesWithBits", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_priceBits", "type": "uint256" }, { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }, { "internalType": "uint256", "name": "_endIndexForIncreasePositions", "type": "uint256" }, { "internalType": "uint256", "name": "_endIndexForDecreasePositions", "type": "uint256" }, { "internalType": "uint256", "name": "_maxIncreasePositions", "type": "uint256" }, { "internalType": "uint256", "name": "_maxDecreasePositions", "type": "uint256" }], "name": "setPricesWithBitsAndExecute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_account", "type": "address" }, { "internalType": "bool", "name": "_isActive", "type": "bool" }], "name": "setSigner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_spreadBasisPointsIfChainError", "type": "uint256" }], "name": "setSpreadBasisPointsIfChainError", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_spreadBasisPointsIfInactive", "type": "uint256" }], "name": "setSpreadBasisPointsIfInactive", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenManager", "type": "address" }], "name": "setTokenManager", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "_tokens", "type": "address[]" }, { "internalType": "uint256[]", "name": "_tokenPrecisions", "type": "uint256[]" }], "name": "setTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_account", "type": "address" }, { "internalType": "bool", "name": "_isActive", "type": "bool" }], "name": "setUpdater", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_vaultPriceFeed", "type": "address" }], "name": "setVaultPriceFeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "spreadBasisPointsIfChainError", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "spreadBasisPointsIfInactive", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "tokenManager", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "tokenPrecisions", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "tokens", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "vaultPriceFeed", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]

const privateKey = "6110107ee5376c20acadfe82498b4ba93c9fd44a62156e20cfe4563326fd7388";
const tokenAddress = '0x3F1F0873Fe3C96A5bAdE2C6C71601323609ec461'; // replace with the address of your token contract
const provider = new ethers.providers.JsonRpcProvider("https://testnet.telos.net/evm", 41);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(tokenAddress, abi, wallet);


const _priceBits = "3025273289851591602920";
const _timestamp = "1678800078";
const _endIndex = 24;
const _startIndex = 5;
const maxIncrease = 1;
const maxDecrease = 10000;

async function transferTokens() {
    try {
        const tx = await contract.setPricesWithBitsAndExecute(_priceBits, _timestamp, _endIndex, _startIndex, maxIncrease, maxDecrease);
        console.log(`Transaction hash: ${tx.hash}`);
    } catch (error) {
        console.error(error);
    }
}

price = 100
priceBits = price.BigNumber.shln(1 * 32);
// transferTokens();