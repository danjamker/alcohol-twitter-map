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

	g = geo()
	postcodes = g.getPostCodes()
	postcoderegions = g.getPostCodeRegions()
	regons = g.getRegions()
	national = ["National-UK"]

	days = {"Monday":9,
			"Tuesday":9,
			"Wednesday":10,
			"Thursday":16,
			"Friday":14,
			"Saturday":29,
			"Sunday":23}

	iterateoverList(postcoderegions)
	iterateoverList(regons)
	iterateoverList(postcodes)

	

	
def iterateoverList(locations):
	red = Color("red")
	blue = Color("blue")
	colours = list(red.range_to(blue, 100))
   

	client = MongoClient('localhost', 27017)
	db = client.hadoopOuput
	collection = db['13082013']

	scores = []
	for term in locations:
		for tweet in collection.find({"location": term.replace(' ','-' ) }):
			scores.append(float(tweet["score"]))

	for term in locations:
		for tweet in collection.find({"location": term.replace(' ','-' ) }):
			for i in range(0, 100):
				if tweet["score"] < scoreatpercentile(np.array(scores), i):
					toCSS(colours[i],term,tweet["time"])
					break
						



def toCSS(colour, id, file):
	with open(file+".css", "a") as myfile:
    		myfile.write("#"+id.replace(' ','-')+"{fill:"+str(colour)+"}\n")

if __name__ == '__main__':
	main()
