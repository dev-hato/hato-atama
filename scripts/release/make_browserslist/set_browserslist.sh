#!/usr/bin/env bash

npm ci
raw_versions="$(curl https://product-details.mozilla.org/1.0/firefox.json)"
versions="$(echo "$raw_versions" | yq -r '.releases.[] | .date + " " + .version + " " + .category' | sort -r)"
browsers=""

for version in $(npx browserslist | grep firefox | awk '{print $2}'); do
	version_data="$(echo "$versions" | grep " $version.[^b]* " | head -n 1)"
	browser_version="$(echo "$version_data" | awk '{print $2}')"
	category="$(echo "$version_data" | awk '{print $3}')"

	if [ "$category" = 'esr' ]; then
		browser_version+="$category"
	fi

	browsers+="{browser_name: \"firefox\", browser_version: \"$browser_version\"}"
done

browserslist="[${browsers//\}\{/\},{}]"
echo "${browserslist}"
echo "browserslist=${browserslist}" >>"${GITHUB_OUTPUT}"
