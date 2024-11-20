#!/bin/bash

ENV_FILE=".env"

openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

openssl rsa -in private_key.pem -pubout -out public_key.pem

PRIVATE_KEY=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' private_key.pem)
PUBLIC_KEY=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' public_key.pem)

echo "PRIVATE_KEY=\"$PRIVATE_KEY\"" > $ENV_FILE
echo "PUBLIC_KEY=\"$PUBLIC_KEY\"" >> $ENV_FILE

rm private_key.pem public_key.pem

echo "Keys have been generated and saved in $ENV_FILE"