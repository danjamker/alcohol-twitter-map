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

	Masterday = datetime.datetime(2013, 05, 23)

	# g = geo()
	# postcodes = g.getPostCodes()
	# postcoderegions = g.getPostCodeRegions()
	# regons = g.getRegions()
	# national = ["National-UK"]

	# days = {"Monday":9,
	# 		"Tuesday":9,
	# 		"Wednesday":10,
	# 		"Thursday":16,
	# 		"Friday":14,
	# 		"Saturday":29,
	# 		"Sunday":23}

	Masterday = datetime.datetime(2013, 05, 23)
	for d in range(0,14):
		print "d"
		print d
		t = (Masterday+datetime.timedelta(days=d)).strftime("%Y-%m-%d") 
		print t
		iterateoverList(t)
		for h in range(0, 23):
			t = (Masterday+datetime.timedelta(days=d, hours = h)).strftime("%Y-%m-%dT%H") 
			print t
			iterateoverList(t)
	#iterateoverList(postcoderegions)
	#iterateoverList(regons)
	#iterateoverList(postcodes)

	

	
def iterateoverList(time):
	
	red = Color("red")
	blue = Color("blue")
	colours = list(red.range_to(blue, 100))
   

	client = MongoClient('localhost', 27017)
	db = client.hadoopOuput
	collection = db['13082013']

	scores = []
	with open(time+".css", "a") as myfile:
		for tweet in collection.find({"time": time }):
			scores.append(float(tweet["score"]))

		for tweet in collection.find({"time": time }):
			for i in range(0, 100):
				if tweet["score"] < scoreatpercentile(np.array(scores), i):
					print tweet["location"]
					myfile.write("#"+tweet["location"]+"{fill:"+str(colours[i])+"}\n")
					break


if __name__ == '__main__':
	main()
