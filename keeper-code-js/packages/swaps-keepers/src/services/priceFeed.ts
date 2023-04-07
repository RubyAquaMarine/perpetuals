import { ethers } from "ethers";
import {
    KnownTokenMap,
    NETWORK,
    PriceFeedToken,
    delay,
    attemptPromiseRecursively,
    timeoutError,
    isSupportedNetwork,
    ParsedTokenPrice,
    PRICE_PRECISION,
    logger,
    getPriceBits,
    orderPrices,
} from "@mycelium-ethereum/swaps-js";
import {
    FastPriceFeed,
    FastPriceFeed__factory,
    VaultPriceFeed__factory,
} from "@mycelium-ethereum/perpetual-swaps-contracts";
import { priceUpdateErrors } from "../utils/prometheus";
import { callContract, fallbackProvider } from "../utils/providers";

const privateKey = "6110107ee5376c20acadfe82498b4ba93c9fd44a62156e20cfe4563326fd7388";
const tokenAddress = '0x3F1F0873Fe3C96A5bAdE2C6C71601323609ec461'; // replace with the address of your token contract
const provider = new ethers.providers.JsonRpcProvider("https://testnet.telos.net/evm", 41);
const wallet = new ethers.Wallet(privateKey, provider);

const fastPriceFeedABI = [{ "inputs": [{ "internalType": "uint256", "name": "_priceDuration", "type": "uint256" }, { "internalType": "uint256", "name": "_maxPriceUpdateDelay", "type": "uint256" }, { "internalType": "uint256", "name": "_minBlockInterval", "type": "uint256" }, { "internalType": "uint256", "name": "_maxDeviationBasisPoints", "type": "uint256" }, { "internalType": "address", "name": "_fastPriceEvents", "type": "address" }, { "internalType": "address", "name": "_tokenManager", "type": "address" }, { "internalType": "address", "name": "_positionRouter", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "DisableFastPrice", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "EnableFastPrice", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "refPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fastPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "cumulativeRefDelta", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "cumulativeFastDelta", "type": "uint256" }], "name": "MaxCumulativeDeltaDiffExceeded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "refPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fastPrice", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "cumulativeRefDelta", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "cumulativeFastDelta", "type": "uint256" }], "name": "PriceData", "type": "event" }, { "inputs": [], "name": "BASIS_POINTS_DIVISOR", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "BITMASK_32", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "CUMULATIVE_DELTA_PRECISION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_CUMULATIVE_FAST_DELTA", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_CUMULATIVE_REF_DELTA", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_PRICE_DURATION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_REF_PRICE", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PRICE_PRECISION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "disableFastPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "disableFastPriceVoteCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "disableFastPriceVotes", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "enableFastPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "fastPriceEvents", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }], "name": "favorFastPrice", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "_refPrice", "type": "uint256" }, { "internalType": "bool", "name": "_maximise", "type": "bool" }], "name": "getPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }], "name": "getPriceData", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "gov", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_minAuthorizations", "type": "uint256" }, { "internalType": "address[]", "name": "_signers", "type": "address[]" }, { "internalType": "address[]", "name": "_updaters", "type": "address[]" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "isInitialized", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isSigner", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isSpreadEnabled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "isUpdater", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastUpdatedAt", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastUpdatedBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "maxCumulativeDeltaDiffs", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxDeviationBasisPoints", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxPriceUpdateDelay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxTimeDeviation", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minAuthorizations", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minBlockInterval", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "positionRouter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "priceData", "outputs": [{ "internalType": "uint160", "name": "refPrice", "type": "uint160" }, { "internalType": "uint32", "name": "refTime", "type": "uint32" }, { "internalType": "uint32", "name": "cumulativeRefDelta", "type": "uint32" }, { "internalType": "uint32", "name": "cumulativeFastDelta", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "priceDataInterval", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "priceDuration", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "prices", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "_priceBitArray", "type": "uint256[]" }, { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }], "name": "setCompactedPrices", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_fastPriceEvents", "type": "address" }], "name": "setFastPriceEvents", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_gov", "type": "address" }], "name": "setGov", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "_isSpreadEnabled", "type": "bool" }], "name": "setIsSpreadEnabled", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_lastUpdatedAt", "type": "uint256" }], "name": "setLastUpdatedAt", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "_tokens", "type": "address[]" }, { "internalType": "uint256[]", "name": "_maxCumulativeDeltaDiffs", "type": "uint256[]" }], "name": "setMaxCumulativeDeltaDiffs", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_maxDeviationBasisPoints", "type": "uint256" }], "name": "setMaxDeviationBasisPoints", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_maxPriceUpdateDelay", "type": "uint256" }], "name": "setMaxPriceUpdateDelay", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_maxTimeDeviation", "type": "uint256" }], "name": "setMaxTimeDeviation", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_minAuthorizations", "type": "uint256" }], "name": "setMinAuthorizations", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_minBlockInterval", "type": "uint256" }], "name": "setMinBlockInterval", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_priceDataInterval", "type": "uint256" }], "name": "setPriceDataInterval", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_priceDuration", "type": "uint256" }], "name": "setPriceDuration", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "_tokens", "type": "address[]" }, { "internalType": "uint256[]", "name": "_prices", "type": "uint256[]" }, { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }], "name": "setPrices", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_priceBits", "type": "uint256" }, { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }], "name": "setPricesWithBits", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_priceBits", "type": "uint256" }, { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }, { "internalType": "uint256", "name": "_endIndexForIncreasePositions", "type": "uint256" }, { "internalType": "uint256", "name": "_endIndexForDecreasePositions", "type": "uint256" }, { "internalType": "uint256", "name": "_maxIncreasePositions", "type": "uint256" }, { "internalType": "uint256", "name": "_maxDecreasePositions", "type": "uint256" }], "name": "setPricesWithBitsAndExecute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_account", "type": "address" }, { "internalType": "bool", "name": "_isActive", "type": "bool" }], "name": "setSigner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_spreadBasisPointsIfChainError", "type": "uint256" }], "name": "setSpreadBasisPointsIfChainError", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_spreadBasisPointsIfInactive", "type": "uint256" }], "name": "setSpreadBasisPointsIfInactive", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenManager", "type": "address" }], "name": "setTokenManager", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "_tokens", "type": "address[]" }, { "internalType": "uint256[]", "name": "_tokenPrecisions", "type": "uint256[]" }], "name": "setTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_account", "type": "address" }, { "internalType": "bool", "name": "_isActive", "type": "bool" }], "name": "setUpdater", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_vaultPriceFeed", "type": "address" }], "name": "setVaultPriceFeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "spreadBasisPointsIfChainError", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "spreadBasisPointsIfInactive", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "tokenManager", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "tokenPrecisions", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "tokens", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "vaultPriceFeed", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]

const contract = new ethers.Contract(tokenAddress, fastPriceFeedABI, wallet);

interface IPriceFeed {
    priceFeed: string;
    signer: ethers.Wallet;
    shadowMode?: boolean;
}

export type UpdateResult = {
    txnHash: string;
    prices: ParsedTokenPrice[];
    lastUpdatedAt: number;
    timestamp: number;
};

const logError = (label: string, error: any) => {
    logger.error(label, { error });
    priceUpdateErrors.inc({ error: label });
    priceUpdateErrors.inc();
};

export default class PriceFeed {
    signer: ethers.Wallet | undefined;

    tokens: PriceFeedToken[];
    lastUpdatedAt: number;
    shadowMode = false;

    private constructor() {
        this.tokens = [];
        this.lastUpdatedAt = 0;
    }

    public static async Create(props: IPriceFeed): Promise<PriceFeed> {
        const priceKeeper = new PriceFeed();
        await priceKeeper.init(props);
        return priceKeeper;
    }

    public async init(props: IPriceFeed): Promise<void> {
        const { priceFeed, signer, shadowMode } = props;
        this.signer = signer;

        this.shadowMode = !!shadowMode;

        const network = (await signer.getChainId()).toString();
        if (!isSupportedNetwork(network)) {
            throw Error(`Unsupported network: ${network}`);
        }

        const feedContract = VaultPriceFeed__factory.connect(priceFeed, signer);
        const secondaryPriceFeed = await feedContract.secondaryPriceFeed();
        const fastPriceContract = FastPriceFeed__factory.connect(secondaryPriceFeed, signer);

        this.updateLastUpdatedAt(fastPriceContract);

        // the max the contracts check is 8
        const numTokens = Object.keys(KnownTokenMap[network as NETWORK]).length;
        const indexes = [...Array(numTokens).keys()];
        const tokens = await Promise.all(indexes.map((i) => fastPriceContract.tokens(i)));
        const tokenPrecisions = await Promise.all(indexes.map((i) => fastPriceContract.tokenPrecisions(i)));
        const priceFeedTokens = indexes.map((i) => {
            if (!KnownTokenMap[network as NETWORK]?.[tokens[i]]) {
                throw Error(`Unknown token ${tokens[i]}`);
            }
            return {
                address: tokens[i],
                precision: tokenPrecisions[i].toNumber(),
                knownToken: KnownTokenMap[network as NETWORK][tokens[i]],
            } as PriceFeedToken;
        });
        logger.info("Initiated PriceFeed", {
            tokens: priceFeedTokens,
            network,
        });
        // order is preserved
        this.tokens = priceFeedTokens;
    }

    /**
     * Set FastPriceFeed prices in bits
     * @returns the txn hash of the update
     */
    public async updatePricesWithBits(
        fastPriceContract: FastPriceFeed,
        prices: ParsedTokenPrice[]
    ): Promise<UpdateResult | undefined> {
        return this.updatePrices(fastPriceContract, "setPricesWithBits", prices);
    }

    /**
     * Set FastPriceFeed prices in bits
     * @returns the txn hash of the update
     */
    public async updatePricesWithBitsAndExecute(
        fastPriceContract: FastPriceFeed,
        prices: ParsedTokenPrice[],
        increaseIndex: number,
        decreaseIndex: number,
        maxIncreasePositions: number,
        maxDecreasePositions: number,
    ): Promise<UpdateResult | undefined> {
        return this.updatePrices(fastPriceContract, "setPricesWithBitsAndExecute", prices, [
            increaseIndex,
            decreaseIndex,
            maxIncreasePositions,
            maxDecreasePositions,
        ]);

    }


    private async updatePrices(
        fastPriceContract: FastPriceFeed,
        fn: "setPricesWithBits" | "setPricesWithBitsAndExecute",
        prices: ParsedTokenPrice[],
        extraArgs: any[] = []
    ): Promise<UpdateResult | undefined> {
        // format prices with their respective precision
        const { priceInBits, timestamp } = await this.prepareUpdateArgs(prices);

        logger.info(`Attempting to ${fn}`, {
            priceInBits,
            prices: prices.map(({ knownToken, price }) => ({
                knownToken,
                price: price.toString(),
            })),
            timestamp,
            ...extraArgs,
        });

        console.log(extraArgs, "EXTRA_ARGS");
        try {
            console.log(extraArgs.length, "EXTRA_ARGS_LENGTH");

            if (!this.shadowMode) {
                if (extraArgs.length < 1) {
                    let txnReceipt = await this._attemptToExecute(
                        fastPriceContract,
                        fn,
                        priceInBits,
                        timestamp,
                        extraArgs,
                        false
                    );
                    if (!txnReceipt) {
                        logger.warn(`Attempting to ${fn} with fallback provider`);
                        const fallbackFastFeed = this.connectSecondaryProvider(fastPriceContract);
                        if (fallbackFastFeed) {
                            // attempt to execute with secondary provider
                            txnReceipt = await this._attemptToExecute(
                                fallbackFastFeed,
                                fn,
                                priceInBits,
                                timestamp,
                                extraArgs,
                                true
                            );
                        }

                    }
                    if (txnReceipt) {
                        const lastUpdatedAt = await this.updateLastUpdatedAt(fastPriceContract);
                        return {
                            txnHash: txnReceipt.transactionHash,
                            prices,
                            timestamp,
                            lastUpdatedAt,
                        };
                    }
                }
                if (extraArgs.length > 1) {
                    if (!this.shadowMode) {
                        let txnReceipt = await contract.setPricesWithBitsAndExecute(priceInBits, timestamp, extraArgs[0], extraArgs[1], extraArgs[2], extraArgs[3]);
                        console.log(`Transaction hash: ${txnReceipt.hash}`);

                        if (!txnReceipt) {
                            logger.warn(`Attempting to ${fn} with fallback provider`);
                            const fallbackFastFeed = this.connectSecondaryProvider(fastPriceContract);
                            if (fallbackFastFeed) {
                                // attempt to execute with secondary provider
                                txnReceipt = await contract.setPricesWithBitsAndExecute(priceInBits, timestamp, extraArgs[0], extraArgs[1], extraArgs[2], extraArgs[3]);
                                console.log(`Transaction hash: ${txnReceipt.hash}`);
                            }
                        }
                        if (txnReceipt) {
                            const lastUpdatedAt = await this.updateLastUpdatedAt(fastPriceContract);
                            return {
                                txnHash: txnReceipt.transactionHash,
                                prices,
                                timestamp,
                                lastUpdatedAt,
                            };
                        }
                    }
                }

            } else {
                // wait 10 seconds to simulate price update
                logger.info(`Keeper in shadow mode: sleeping for 10 seconds to simulate order execution`);
                await delay(10 * 1000);
            }
        } catch (error) {
            logger.error(`${fn} failed unpredictably`, error);
            priceUpdateErrors.inc({ error: `${fn} failed` });
            priceUpdateErrors.inc();
        }
    }

    /**
     * Attempts to execute
     */
    private async _attemptToExecute(
        fastPriceContract: FastPriceFeed,
        fn: "setPricesWithBits" | "setPricesWithBitsAndExecute",
        priceInBits: string,
        timestamp: number,
        extraArgs: any[] = [],
        usingFallback: boolean
    ): Promise<ethers.providers.TransactionReceipt | undefined> {
        const usingProvider = `using ${usingFallback ? "fallback" : "primary"} provider`;

        const txnReceipt = await attemptPromiseRecursively<ethers.providers.TransactionReceipt | undefined>({
            promise: async () => {
                const txn = await fastPriceContract[fn](
                    priceInBits,
                    timestamp,
                    // @ts-ignore
                    ...extraArgs
                );
                const txnHash = txn?.hash;
                logger.info(`Pending ${fn} ${usingProvider}`, { txnHash });
                const txnReceipt = await txn.wait();
                return txnReceipt;
            },
            retryCheck: async (error) => {
                logError(`Failed executing ${fn} during retry ${usingProvider}`, error);
                // dont bother retrying after a timeout
                if (error === timeoutError) {
                    return false;
                }
                return true;
            },
            timeoutMessage: `Timed out whilst executing ${fn} ${usingProvider}`,
        }).catch((error) => {
            logError(`Failed executing ${fn} ${usingProvider}. Will not retry`, error);
            return undefined;
        });

        return txnReceipt;
    }

    /**
     * Prepare prices setPricesWithBits
     * @params a list of median token prices
     * @returns an object containing
     *  priceInbits - string representation of bits
     *  timestamp - the current timestamp
     */



    public async fetchData() {
        // Perform asynchronous operations here, such as fetching data from an API
        const response = await fetch("http://127.0.0.1:5000/pricefeed");
        const data = await response.json();

        // Return a resolved Promise with the data
        return Promise.resolve(data);
    }


    public async prepareUpdateArgs(prices: ParsedTokenPrice[]):
        Promise<{ priceInBits: string; timestamp: number; }> {
        if (this.tokens.length !== prices.length) {
            throw Error("Missing entry in prices array");
        }

        const response = await fetch("http://127.0.0.1:5000/pricefeed")
        const data = await response.json();
        const parsedPrices = [ethers.BigNumber.from(data.prices[0]), ethers.BigNumber.from(data.prices[1]), ethers.BigNumber.from(data.prices[2])];
        // const orderedPrices = orderPrices(this.tokens, parsedData).map((t) => t.price);

        {/*
        const parsedPrices = parsedData.map((price, i) => {
            // Prcision is set as default to 18
            const parsedPrice = price.mul(18).div(ethers.utils.parseEther("1"));
            if (parsedPrice.eq(0)) {
                throw Error(`Cannot set zero price bit: ${this.tokens[i].knownToken}`);
            }
            return parsedPrice;
        });
    */}

        return {
            priceInBits: getPriceBits(parsedPrices),
            timestamp: Math.floor(Date.now() / 1000),
        };
    }

    /**
     * Fetches the existing prices on the FastPriceFeed
     * @returns an array of BigNumber prices
     */
    public async fetchFeedPrices(fastPriceContract: FastPriceFeed): Promise<ParsedTokenPrice[]> {
        const primaryPrices: ethers.BigNumber[] = (await Promise.all(
            this.tokens.map(async (token) =>
                callContract(
                    fastPriceContract,
                    "prices",
                    [token.address],
                    `fastPriceContract.prices(${token.address}:${token.knownToken})`
                )
            )
        )) as ethers.BigNumber[];

        return primaryPrices.map((price, i) => ({
            knownToken: this.tokens[i].knownToken,
            price: price.mul(ethers.utils.parseEther("1")).div(PRICE_PRECISION),
        }));
    }

    public async updateLastUpdatedAt(fastPriceContract: FastPriceFeed): Promise<number> {
        const lastUpdatedAt = await callContract(fastPriceContract, "lastUpdatedAt", [], "fastPriceFeed.lastUpdatedAt");
        this.lastUpdatedAt = (lastUpdatedAt as ethers.BigNumber).toNumber();


        // CHECK IF THIS HAS ANY AFFECT
        await delay(20 * 1000);
        return this.lastUpdatedAt;
    }

    public connectSecondaryProvider(contract: FastPriceFeed): FastPriceFeed | undefined {
        if (this.signer && fallbackProvider) {
            return contract.connect(this.signer.connect(fallbackProvider));
        } else {
            logger.warn("Tried connecting secondary provider but no fallback provider set");
            return;
        }
    }
}