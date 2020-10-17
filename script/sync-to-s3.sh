#!/bin/bash

aws s3 sync web s3://some-lambda-thing --acl public-read --exclude "*" --include "*.html" --include "*.js"
