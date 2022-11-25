#!/bin/bash
CONTAINER_NAME=$1
CONTAINER_STATUS=`docker inspect -f '{{.State.Running}}' $CONTAINER_NAME`
STATUS=1

if [[ "$CONTAINER_STATUS" == "true" ]]; then
	STATUS=0
#	echo -e "\e[32mContainer status is running \e[0m"
	echo $STATUS
 #       echo "Checking port connetion"        
else
	STATUS=1
	echo $STATUS
#	echo -e "\e[31mContainer status is FAIL \e[0m"
fi
