import json
import numpy as np
from geo import geo
from pymongo import MongoClient
import datetime
import time, os
from scipy.stats import scoreatpercentile
from colour import Color

BLUE = "#0000FF"

RED = "#FF0000"

def main():

	g = geo()
	postcodes = g.getPostCodes()
	postcoderegions = g.getPostCodeRegions()
	regons = g.getRegions()
	national = ["National-UK"]
	client = MongoClient('localhost', 27017)
	db = client.hadoopOuput
	collection = db['13082013']
	scores = []
	for loc in postcoderegions:
		for tweet in collection.find({"location": loc }):
			scores.append(float(tweet["score"]))
	distribution = np.array(scores)

	Masterday = datetime.datetime(2013, 05, 23)
	for d in range(0,14):
		t = (Masterday+datetime.timedelta(days=d)).strftime("%Y-%m-%d") 
		#iterateoverList(distribution, t, postcoderegions)
		for h in range(0, 23):
			t = (Masterday+datetime.timedelta(days=d, hours = h)).strftime("%Y-%m-%dT%H") 
			iterateoverList(distribution, t, postcoderegions)

	
def iterateoverList(distribution, time, location):
	print time
	red = Color("red")
	blue = Color("blue")
	colours = list(red.range_to(blue, 100))
   

	client = MongoClient('localhost', 27017)
	db = client.hadoopOuput
	collection = db['13082013']


	with open(time+".css", "a") as myfile:
		for tweet in collection.find({"time": time }):
			for i in range(0, 100):
				if tweet["type"] == "hourly":
					if tweet["location"] in location:
						if tweet["score"] < scoreatpercentile(distribution, i):
							myfile.write("#"+tweet["location"]+"{fill:"+str(colours[i])+"}\n")
							break

	print "Exiting"
	print ""


if __name__ == '__main__':
	main()
