#!/usr/bin/env bash

# 最大10分待つ
for i in $(seq 600); do
  serving_status=$(gcloud app versions describe \
    "v${RUN_NUMBER}" \
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
