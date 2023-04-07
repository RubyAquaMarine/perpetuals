from dotenv import load_dotenv
from web3.middleware import geth_poa_middleware
from web3 import Web3 
import time 
import os
import abis
import json

arbitrumTokens = ["0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", #BTC
                  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"] #ETH


def getTelosWeb3Client():
    networkRpc = "https://mainnet.telos.net/evm"
    web3Client = Web3(Web3.HTTPProvider(networkRpc))
    web3Client.middleware_onion.inject(geth_poa_middleware, layer=0)
    return web3Client

def getTelosFallbackWeb3Client():
    networkRpc = "https://rpc1.us.telos.net/evm"
    web3Client = Web3(Web3.HTTPProvider(networkRpc))
    web3Client.middleware_onion.inject(geth_poa_middleware, layer=0)
    return web3Client

def getArbitrumWeb3Client():
    networkRpc = "https://arb1.arbitrum.io/rpc"
    web3Client = Web3(Web3.HTTPProvider(networkRpc))
    web3Client.middleware_onion.inject(geth_poa_middleware, layer=0)
    return web3Client 

tlos_w3 = getTelosWeb3Client()
tlosFallback_w3 = getTelosFallbackWeb3Client()
arb_w3 = getArbitrumWeb3Client()
arbFallback_w3 = getArbitrumWeb3Client()

with open("config.json", "r") as jsonFile:
    config = json.load(jsonFile)  

load_dotenv()
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
PUBLIC_KEY = tlos_w3.toChecksumAddress(os.getenv('PUBLIC_KEY'))

# 8 Decimal Precision prices for BTC/ETH directly from GMX fast price feed.
def getFastPriceFeed():
    try:
        address= Web3.toChecksumAddress(config["arbitrumContracts"]["GmxFastPriceFeed"])
        fastPriceFeed = arb_w3.eth.contract(address=address, abi=abis.fastPriceFeed()) # declaring the token contract
        batchPrices = []
        for i in arbitrumTokens:
            prices = fastPriceFeed.functions.getPriceData(i).call()
            batchPrices.append(prices[0]*10**-5)
        return batchPrices
    except:
        address= Web3.toChecksumAddress(config["arbitrumContracts"]["GmxFastPriceFeed"])
        fastPriceFeed = arbFallback_w3.eth.contract(address=address, abi=abis.fastPriceFeed()) # declaring the token contract
        batchPrices = []
        for i in arbitrumTokens:
            prices = fastPriceFeed.functions.getPriceData(i).call()
            batchPrices.append(prices[0]*10**-5)
        return batchPrices
        
#Exact TLOS price on OmniDex
def OmniDexWTLOSPrice():
    try:
        routerContract = tlos_w3.eth.contract(address=config["telosMainnetContracts"]["OmniDexRouter"], abi=abis.router())
        oneToken = tlos_w3.toWei(1, 'Ether')
        price = routerContract.functions.getAmountsOut(oneToken, [config["telosTokens"]["WTLOS"], config["telosTokens"]["USDC"]]).call()
        normalizedPrice = tlos_w3.fromWei(price[1], 'Ether')
        return float(normalizedPrice*10**15)
    except:
        routerContract = tlosFallback_w3.eth.contract(address=config["telosMainnetContracts"]["OmniDexRouter"], abi=abis.router())
        oneToken = tlosFallback_w3.toWei(1, 'Ether')
        price = routerContract.functions.getAmountsOut(oneToken, [config["telosTokens"]["WTLOS"], config["telosTokens"]["USDC"]]).call()
        normalizedPrice = tlosFallback_w3.fromWei(price[1], 'Ether')
        return float(normalizedPrice*10**15)

#Exact TLOS price on ApeSwap
def ApeSwapWTLOSPrice():
    try:
        routerContract = tlos_w3.eth.contract(address=config["telosMainnetContracts"]["ApeSwapRouter"], abi=abis.router())
        oneToken = tlos_w3.toWei(1, 'Ether')
        price = routerContract.functions.getAmountsOut(oneToken, [config["telosTokens"]["WTLOS"], config["telosTokens"]["USDC"]]).call()
        normalizedPrice = tlos_w3.fromWei(price[1], 'Ether')
        return float(normalizedPrice*10**15)
    except:
        routerContract = tlosFallback_w3.eth.contract(address=config["telosMainnetContracts"]["ApeSwapRouter"], abi=abis.router())
        oneToken = tlosFallback_w3.toWei(1, 'Ether')
        price = routerContract.functions.getAmountsOut(oneToken, [config["telosTokens"]["WTLOS"], config["telosTokens"]["USDC"]]).call()
        normalizedPrice = tlosFallback_w3.fromWei(price[1], 'Ether')
        return float(normalizedPrice*10**15)
        
#Average TLOS price on tEVM
def getAverageTLOSPrice():
     return (ApeSwapWTLOSPrice()+OmniDexWTLOSPrice())/2
 
#Append TLOS price to list with BTC and ETH
def retrieveAllData():
    arbprices = getFastPriceFeed()
    telosPrices = int(getAverageTLOSPrice())
    priceList = arbprices + [telosPrices]
    
    aggregatedPriceList = []
    for i in priceList:
        aggregatedPriceList.append(str(int(i)))
    return aggregatedPriceList

print(retrieveAllData())