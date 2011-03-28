#!/bin/bash

DIR=plugins

FILES=( " " )

PLUGINS=$(find $DIR -name 'popcorn.*.unit.html' )

DATA=${DIR}/plugins.json

i=0

for f in $PLUGINS
do
	FILES=("${FILES[@]}" "\"$f\",")
	((i++))
done

FILES[$i]=${FILES[$i]%%,}

echo "{ \"plugins\" : [ ${FILES[@]} ] }" > $DATA


################################################################################


DIR=parsers

FILES=( " " )

PLUGINS=$(find $DIR -name 'popcorn.*.unit.html' )

DATA=${DIR}/parsers.json

i=0

for f in $PLUGINS
do
	FILES=("${FILES[@]}" "\"$f\",")
	((i++))
done

FILES[$i]=${FILES[$i]%%,}

echo "{ \"parsers\" : [ ${FILES[@]} ] }" > $DATA


