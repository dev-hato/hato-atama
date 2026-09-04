#!/usr/bin/env bash
set -e

version="v${RUN_NUMBER}"
gcloud app deploy app.yaml --version "$version" --no-promote --quiet

# 最大10分待つ
for i in $(seq 600); do
	serving_status=$(gcloud app versions describe \
		"$version" \
		--service "default" \
		--format \
		"value(servingStatus)")
	echo "${i}: servingStatus: ${serving_status}"

	if [ "${serving_status}" = "SERVING" ]; then
		exit 0
	fi

	sleep 1
done

exit 1
