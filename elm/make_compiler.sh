#!/usr/bin/env bash

cd ..
image_tag='hato_atama_elm_compiler'
docker build -t "${image_tag}" -f elm/Dockerfile .
container_id=$(docker create "${image_tag}")
docker cp "${container_id}:/usr/local/bin/elm" elm_arm64
docker stop "${container_id}"
docker rm "${container_id}"
