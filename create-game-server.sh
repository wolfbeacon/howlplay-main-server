#!/bin/bash

IFS=':'

if [ $# -eq 0 ]
then
  echo 'Usage: ./create-game-server.sh ENV_VAR_0:value_0 ENV_VAR_1:value_1 ... ENV_VAR_N:value_N';
  exit 1;
fi

while (("$#"));
do
  var=($1)
  declare "${var[0]}"=${var[1]};
  shift;
done

docker run --env QUIZ_HASH --env ADMIN_KEY ubuntu env | grep VAR
