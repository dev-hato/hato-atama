#!/usr/bin/env bash

sed -i -e "s/runtime:.*/${GO_VERSION}/g" app.yaml
rm runtime.html
