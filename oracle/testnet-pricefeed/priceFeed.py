import abis
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
from web3 import Web3
import json
from pycoingecko import CoinGeckoAPI
import os

with open("config.json", "r") as jsonFile:
    config = json.load(jsonFile)

def getWeb3Client():
    networkRpc = "https://testnet.telos.net/evm"
    web3Client = Web3(Web3.HTTPProvider(networkRpc))
    web3Client.middleware_onion.inject(geth_poa_middleware, layer=0)
    return web3Client

with open("output.json", "r") as jsonFile:
    output = json.load(jsonFile) 
    
def updateOutput():
    with open("output.json", "w") as jsonFile:
        json.dump(output, jsonFile)

w3 = getWeb3Client()
load_dotenv()

PRIVATE_KEY = os.getenv('PRIVATE_KEY')
PUBLIC_KEY = w3.toChecksumAddress(os.getenv('PUBLIC_KEY'))

def setPrices(parsedAssetPrice):
    btcContract = w3.eth.contract(address= "0x88d911B0423036029926177d21744c224049B903", abi=abis.testPrimaryPriceFeed())
    ethContract = w3.eth.contract(address= "0xAFB68373b8b0008944303183b2F2467b5313f033", abi=abis.testPrimaryPriceFeed())
    wtlosContract = w3.eth.contract(address= "0x7385DB24D70527b535e5884dbB7c9cb6C0d64e49", abi=abis.testPrimaryPriceFeed())
    
    try:
        transaction = btcContract.functions.setLatestAnswer(parsedAssetPrice[0]).buildTransaction({"gasPrice": w3.eth.gas_price, "from": PUBLIC_KEY, "nonce": w3.eth.getTransactionCount(PUBLIC_KEY)})
        signedTransaction = w3.eth.account.signTransaction(transaction, private_key=PRIVATE_KEY)
        w3.eth.sendRawTransaction(signedTransaction.rawTransaction)
        
        transaction = ethContract.functions.setLatestAnswer(parsedAssetPrice[1]).buildTransaction({"gasPrice": w3.eth.gas_price, "from": PUBLIC_KEY, "nonce": w3.eth.getTransactionCount(PUBLIC_KEY)})
        signedTransaction = w3.eth.account.signTransaction(transaction, private_key=PRIVATE_KEY)
        w3.eth.sendRawTransaction(signedTransaction.rawTransaction)
        
        transaction = wtlosContract.functions.setLatestAnswer(parsedAssetPrice[2]).buildTransaction({"gasPrice": w3.eth.gas_price, "from": PUBLIC_KEY, "nonce": w3.eth.getTransactionCount(PUBLIC_KEY)})
        signedTransaction = w3.eth.account.signTransaction(transaction, private_key=PRIVATE_KEY)
        w3.eth.sendRawTransaction(signedTransaction.rawTransaction)
        print("Prices set!")
    except:
        print("Error setting prices")
        pass
    
def writePriceDataToFile(priceData):
    with open("packages/python/prices.json", "w", encoding='utf-8') as priceDataFile:
        json.dump(priceData, priceDataFile, ensure_ascii=False, indent=2)
        
def getBatchCGPricesAndUpdate():
    coinGeckoIDs = []
    for token in config["assetSymbols"]:
        coinGeckoIDs.append(config[token]["coingecko_id"])
    coingeckoApiClient = CoinGeckoAPI()
    assetPrice = coingeckoApiClient.get_price(ids=coinGeckoIDs, vs_currencies='usd')
     
    parsedAssetPrice = []
    for token in config["assetSymbols"]:
        prices = assetPrice[config[token]["coingecko_id"]]["usd"]
        parsedAssetPrice.append(int(prices*10**8))
    output["prices"] = parsedAssetPrice; updateOutput()
    setPrices(parsedAssetPrice)

getBatchCGPricesAndUpdate()