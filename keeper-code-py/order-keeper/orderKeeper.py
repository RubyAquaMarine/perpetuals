from dotenv import load_dotenv
from web3.middleware import geth_poa_middleware
from web3 import Web3
import json
import os    
import time 
import helper

load_dotenv()
w3 = helper.getWeb3Client()
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
PUBLIC_KEY = w3.toChecksumAddress(os.getenv('PUBLIC_KEY'))