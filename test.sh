#!/usr/bin/env bash

for i in $(seq 400)
do
  cp base.go test$i.go
done
