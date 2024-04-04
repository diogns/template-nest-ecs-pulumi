#!/usr/bin/env bash

REPOSITORY=$1

CODEARTIFACT_AUTH_TOKEN=$(aws codeartifact get-authorization-token --domain aunalibs --duration-seconds 1200 --domain-owner 587279634644 --query authorizationToken --output text)
npm config -L project set registry=https://aunalibs-587279634644.d.codeartifact.us-east-1.amazonaws.com/npm/${REPOSITORY}/
npm config -L project set //aunalibs-587279634644.d.codeartifact.us-east-1.amazonaws.com/npm/${REPOSITORY}/:always-auth=true
npm config -L project set //aunalibs-587279634644.d.codeartifact.us-east-1.amazonaws.com/npm/${REPOSITORY}/:_authToken=$CODEARTIFACT_AUTH_TOKEN
