#!/bin/bash
SAVEIFS=$IFS
IFS=$(echo -en "\n\b")
FILES=~/Documents/Code/TweetDoop/test/DataT/GEOjson/*
for f in $FILES
do
	echo ${f##*/}
	y=${f##*/}
	togeojson $f > ./${y%.kml}.json
done
