#!/bin/bash

FUNCTION_NAME="ProcessGameUpload"

cd lambda/processGameUpload
npm install
zip -r ../processGameUpload.zip index.js node_modules
cd ..

aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://processGameUpload.zip

rm processGameUpload.zip
