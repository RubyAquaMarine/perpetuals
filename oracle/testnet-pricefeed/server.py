
from flask import Flask, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import json
import priceFeed

app = Flask(__name__)

def updatePrices():
    try:
        priceFeed.getBatchCGPricesAndUpdate()

    except:
        print("Failed")
        pass
         
def fetchPrices():
    with open("output.json", "r") as jsonFile:
        prices = json.load(jsonFile)
    return prices

scheduler = BackgroundScheduler()
scheduler.add_job(func=updatePrices, trigger="interval", seconds=30)
scheduler.start()

@app.route('/')
def index():
    return "OmniDex Price Feed"

@app.route("/pricefeed",methods=['GET'])
def get():
    prices = fetchPrices()
    return jsonify(prices)

if __name__ == "__main__":
    app.run(debug=True)