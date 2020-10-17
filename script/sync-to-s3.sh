#!/bin/bash

aws s3 sync web s3://some-lambda-thing --acl public-read --exclude "*" --include index.html --include error.html
