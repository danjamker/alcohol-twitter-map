from math import radians, cos, sin, asin, sqrt
import csv

class geo:

    def __init__(self):
        self.data = []
        self.dataRegion = {}
        with open('../Data/postcodes.csv', 'rb') as csvfile:
            reader = csv.reader(csvfile)
            reader.next()
            for row in reader:
                tmp = {"id":row[0],"long":row[3],"lat":row[2],"postcode":row[1]}
                self.data.append(tmp)
 
        with open('../Data/rostcodetoRegion.csv', 'rU') as csvfile:
            reader = csv.reader(csvfile)
            
            for row in reader:
                self.dataRegion[row[0]] = row[1]
    
    def getPostCodes(self):
        return [record["postcode"] for record in self.data]    

    def getPostCodeRegions(self):
        return self.dataRegion.keys()

    def getRegions(self):
        regions = []
        for key in self.dataRegion:
            if self.dataRegion[key] not in regions:
                regions.append(self.dataRegion[key])
        return regions

    def haversine(self, lon1, lat1, lon2, lat2):
        """
        Calculate the great circle distance between two points 
        on the earth (specified in decimal degrees)
        """
        # convert decimal degrees to radians 
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        # haversine formula 
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a)) 
        km = 6367 * c
        return km

    def findNearestPostCode(self, long, lat):
        smallest = 'null'
        dist = 0 
        
        for row in self.data:

            distTmp = self.haversine( float(row["long"]),float(row["lat"]), float(long), float(lat))
            if smallest == 'null':
                smallest = row["postcode"]
                dist = distTmp

            if distTmp < dist:
                smallest = row["postcode"]
                dist = distTmp

        return smallest

    def findNearPostCodeReagion(self, long, lat):
        tmp = self.findNearestPostCode(long, lat)
        r = ""
        t = True
        for l in tmp:
            if l.isdigit() == False:
                if t == True:
                    r+=str(l)
            else:
                t = False
        
        return r

    def getPostCodeRegonsForRegons(self, regon):
        tmp = []
        for k in self.dataRegion.keys():
            if self.dataRegion[k] == regon:
                tmp.append(k)
        return tmp


    def findNearesRegion(self, long, lat):
        return self.dataRegion[self.findNearPostCodeReagion(long, lat)]
        