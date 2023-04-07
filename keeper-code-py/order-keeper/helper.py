from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
from web3 import Web3
import json
import os    
import time 
import abis
import priceFeed 

with open("config.json", "r") as jsonFile:
    config = json.load(jsonFile)
    

MaxExecutableChunk = 25

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
    
def getWeb3Client():
    networkRpc = config["RPC"]["primary_telos_testnet"]
    web3Client = Web3(Web3.HTTPProvider(networkRpc))
    web3Client.middleware_onion.inject(geth_poa_middleware, layer=0)
    return web3Client
w3 = getWeb3Client()


load_dotenv()
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
PUBLIC_KEY = w3.toChecksumAddress(os.getenv('PUBLIC_KEY'))

def getPricesInBits():
    prices = priceFeed.retrieveAllData()
    a = int(prices[0])
    b =  int(prices[1]) << 32
    c  = int(prices[2]) << 64
    return a+b+c


def fetchFastPriceFeed():
    vaultPriceFeed = w3.eth.contract(address=config["telosTestnetContracts"]["vaultPriceFeed"], abi=abis.vaultPriceFeed())
    fastPriceFeed = vaultPriceFeed.functions.secondaryPriceFeed().call()
    return fastPriceFeed

def getRequestQueueLengths():
    positionRouter = w3.eth.contract(address=config["telosTestnetContracts"]["positionRouter"], abi=abis.positionRouter())
    orderIndex = positionRouter.functions.getRequestQueueLengths().call()
    return orderIndex[0], orderIndex[1], orderIndex[2], orderIndex[3]

def checkIncreasePosition(startIndex, endIndex):
    numberOfOrdersToExecute = endIndex - startIndex
    return startIndex + numberOfOrdersToExecute

def checkDecreasePosition(startIndex, endIndex):
    numberOfOrdersToExecute = endIndex - startIndex
    return startIndex + numberOfOrdersToExecute

def checkForNewOrders():
    now=time.time()
    timer = 0
    while timer < 60:
        startIndexForIncreasePositions, endIndexForIncreasePositions, startIndexForDecreasePositions, endIndexForDecreasePositions = getRequestQueueLengths()
        if startIndexForIncreasePositions!= endIndexForIncreasePositions or startIndexForDecreasePositions!=endIndexForDecreasePositions:
            updatePrices()
        else:
            pass
        end = time.time()
        timer = round(end-now)
        print(timer)


    
def prepareUpdateParams():
    timestamp = int(time.time())
    priceInBits = getPricesInBits()
    startIndexForIncreasePositions, endIndexForIncreasePositions, startIndexForDecreasePositions, endIndexForDecreasePositions = getRequestQueueLengths()
    
    if startIndexForIncreasePositions!= endIndexForIncreasePositions or startIndexForDecreasePositions!=endIndexForDecreasePositions:
        return timestamp, priceInBits, endIndexForIncreasePositions, endIndexForDecreasePositions, True
    else:
        return timestamp, priceInBits, endIndexForIncreasePositions, endIndexForDecreasePositions, False


def updatePrices():
    _timestamp, _priceBits, _endIndexForIncreasePositions, _endIndexForDecreasePositions, outstandingOrders = prepareUpdateParams()
    
    maxIncreasePosition = 1
    maxDecreasePosition = 10000
    
    if outstandingOrders==True:
        try:
            fastPriceFeed = w3.eth.contract(address =fetchFastPriceFeed(), abi=abis.fastPriceFeed())
            print(_priceBits, _timestamp, _endIndexForIncreasePositions, _endIndexForDecreasePositions, maxIncreasePosition, maxDecreasePosition)
            tx = fastPriceFeed.functions.setPricesWithBitsAndExecute(_priceBits, _timestamp, _endIndexForIncreasePositions, _endIndexForDecreasePositions, maxIncreasePosition, maxDecreasePosition).buildTransaction({
            "from": PUBLIC_KEY,
            "gasPrice": w3.eth.gas_price, 
            "nonce": w3.eth.getTransactionCount(PUBLIC_KEY),
            })

            signed_txn = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
            tx_token = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            txReciept = w3.toHex(tx_token)
            print(_priceBits, "Pric in Bits")
            print(txReciept, "setPricesWithBitsAndExecute Completed")
            #time.sleep(10)
            #print("Slept 10 seconds")
            
        except Exception as e: 
            print(e)
    else:
        try:
            fastPriceFeed = w3.eth.contract(address =fetchFastPriceFeed(), abi=abis.fastPriceFeed())
            print(_priceBits, _timestamp)
            tx = fastPriceFeed.functions.setPricesWithBits(_priceBits, _timestamp).buildTransaction({
            "from": PUBLIC_KEY,
            "gasPrice": w3.eth.gas_price, 
            "nonce": w3.eth.getTransactionCount(PUBLIC_KEY),
            })

            signed_txn = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
            tx_token = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            txReciept = w3.toHex(tx_token)
            print(_priceBits, "Pric in Bits")
            print(txReciept, "setPricesWithBits Completed")
            
        except:
            print("NO UPDATE 2")
    
            
        

