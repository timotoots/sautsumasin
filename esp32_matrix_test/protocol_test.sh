#!/bin/bash

#STRIPE=$1
STRIPE=1

if [ -z "$STRIPE" ] ; then
    echo "No stripe number !!!";
    exit 1;
fi

echo "10001 101 2" > /dev/ttyUSB1 &
echo "10001 101 3" > /dev/ttyUSB1 &
echo "10002 101 3" > /dev/ttyUSB0 &
#echo "10002 101 4" > /dev/ttyUSB0
#echo "10002 101 6" > /dev/ttyUSB0
#echo "10003 101 6" > /dev/ttyUSB2
#echo "10003 101 7" > /dev/ttyUSB0

sleep 3

echo "10001 102 2 4" > /dev/ttyUSB1 &
echo "10001 102 3 5" > /dev/ttyUSB1 &
echo "10002 102 3 5" > /dev/ttyUSB0

