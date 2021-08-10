#!/bin/bash
set -e
IFS='|'

AMPLIFY="{\
\"projectName\":\"amplifytestapp\",\
\"envName\":\"dev\",\
\"defaultEditor\":\"code\",\
\"appId\":\"d162eyqazpfkxu\"\
}"

cd ../../../

amplify init \
--amplify $AMPLIFY \
--yes