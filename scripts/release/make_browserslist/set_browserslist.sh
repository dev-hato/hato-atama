#!/usr/bin/env bash

npm ci
raw_versions="$(curl https://product-details.mozilla.org/1.0/firefox.json)"
versions="$(echo "$raw_versions" | yq -r '.releases.[] | .date + " " + .version' | sort -r)"
browsers=""

for version in $(npx browserslist | grep firefox | awk '{print $2}')
do
  browser_version="$(echo "$versions" | grep " $version.[^b]*\$" | head -n 1 | awk '{print $2}')"
  browsers+="{browser_name: \"firefox\", browser_version: \"$browser_version\"}"
done

browserslist="${browsers//\}\{/\},{}"
echo "${browserslist}"
echo "browserslist=${browserslist}" >>"${GITHUB_OUTPUT}"
