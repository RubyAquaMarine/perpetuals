from web3 import Web3 
from web3.middleware import geth_poa_middleware
import json

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

def writePriceDataToFile(priceData):
    with open("packages/python/prices.json", "w", encoding='utf-8') as priceDataFile:
        json.dump(priceData, priceDataFile, ensure_ascii=False, indent=2)