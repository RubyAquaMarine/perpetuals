from dotenv import load_dotenv
from web3.middleware import geth_poa_middleware
from web3 import Web3 
import time 
import os
import abis
import helper
import json

arbitrumTokens = ["0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", #BTC
                  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"] #ETH

tlos_w3 = helper.getTelosWeb3Client()
tlosFallback_w3 = helper.getTelosFallbackWeb3Client()
arb_w3 = helper.getArbitrumWeb3Client()
arbFallback_w3 = helper.getArbitrumWeb3Client()


with open("/Users/johnjudge/Desktop/Code/omnidex/testnet/perpetuals/swaps-offchain-infra/packages/python/config.json", "r") as jsonFile:
    config = json.load(jsonFile)

with open("/Users/johnjudge/Desktop/Code/omnidex/testnet/perpetuals/swaps-offchain-infra/packages/python/output2.json", "r") as jsonFile:
    output = json.load(jsonFile)
    
def updateOutput():
    with open("/Users/johnjudge/Desktop/Code/omnidex/testnet/perpetuals/swaps-offchain-infra/packages/python/output2.json", "w") as jsonFile:
        json.dump(output, jsonFile)   

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
        routerContract = tlos_w3.eth.contract(address=config["telosContracts"]["OmniDexRouter"], abi=abis.router())
        oneToken = tlos_w3.toWei(1, 'Ether')
        price = routerContract.functions.getAmountsOut(oneToken, [config["telosTokens"]["WTLOS"], config["telosTokens"]["USDC"]]).call()
        normalizedPrice = tlos_w3.fromWei(price[1], 'Ether')
        return float(normalizedPrice*10**15)
    except:
        routerContract = tlosFallback_w3.eth.contract(address=config["telosContracts"]["OmniDexRouter"], abi=abis.router())
        oneToken = tlosFallback_w3.toWei(1, 'Ether')
        price = routerContract.functions.getAmountsOut(oneToken, [config["telosTokens"]["WTLOS"], config["telosTokens"]["USDC"]]).call()
        normalizedPrice = tlosFallback_w3.fromWei(price[1], 'Ether')
        return float(normalizedPrice*10**15)

#Exact TLOS price on ApeSwap
def ApeSwapWTLOSPrice():
    try:
        routerContract = tlos_w3.eth.contract(address=config["telosContracts"]["ApeSwapRouter"], abi=abis.router())
        oneToken = tlos_w3.toWei(1, 'Ether')
        price = routerContract.functions.getAmountsOut(oneToken, [config["telosTokens"]["WTLOS"], config["telosTokens"]["USDC"]]).call()
        normalizedPrice = tlos_w3.fromWei(price[1], 'Ether')
        return float(normalizedPrice*10**15)
    except:
        routerContract = tlosFallback_w3.eth.contract(address=config["telosContracts"]["ApeSwapRouter"], abi=abis.router())
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
    output["prices"] = aggregatedPriceList; updateOutput()


retrieveAllData()