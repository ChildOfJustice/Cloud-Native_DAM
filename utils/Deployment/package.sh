#!/bin/bash
# If the directory, `dist`, doesn't exist, create `dist`
stat dist || mkdir dist
# Archive artifacts
rm ./dist/$npm_package_name.zip
cd build || exit
zip -r ../dist/$npm_package_name.zip ./*
