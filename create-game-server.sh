#!/bin/bash

IFS=':'

if [ $# -eq 0 ]
then
  # echo 'Usage: ./create-game-server.sh ENV_VAR_0:value_0 ENV_VAR_1:value_1 ... ENV_VAR_N:value_N';
  echo 'Usage: ./create-game-server.sh QUIZ_HASH:value_0 ADMIN_KEY:value_1';
  exit 1;
fi

while (("$#"));
do
  var=($1)
  declare "${var[0]}"=${var[1]};
  shift;
done

# echo $QUIZ_HASH;
# echo $ADMIN_KEY;
docker run -d=true --env QUIZ_HASH=$QUIZ_HASH --env ADMIN_KEY=$ADMIN_KEY 48d90acd88cc
