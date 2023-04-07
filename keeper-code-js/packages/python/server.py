
from flask import Flask, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import json
import priceFeed

app = Flask(__name__)

def updatePrices():
    try:
        priceFeed.retrieveAllData()

    except:
        print("Failed")
        pass
         
def fetchPrices():
    with open("/Users/johnjudge/Desktop/Code/omnidex/testnet/perpetuals/swaps-offchain-infra/packages/python/output2.json", "r") as jsonFile:
        prices = json.load(jsonFile)
    return prices

scheduler = BackgroundScheduler()
scheduler.add_job(func=updatePrices, trigger="interval", seconds=60)
scheduler.start()

@app.route('/')
def index():
    return "OmniDex Prices API"

@app.route("/pricefeed",methods=['GET'])
def get():
    prices = fetchPrices()
    print(prices)
    return jsonify(prices)

if __name__ == "__main__":
    app.run(debug=True)