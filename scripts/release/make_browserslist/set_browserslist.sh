#!/usr/bin/env bash

browsers="$(npx browserslist | ag firefox | sed -e 's/$/.0/')"
# shellcheck disable=SC2001
browserslist="[$(echo "${browsers}" | sed -e 's/^\([^ ]*\) \(.*\)/{browser_name: "\1", browser_version: "\2"}/' | tr '\n' ',' | sed -e 's/,$//')]"
echo "${browserslist}"
echo "browserslist=${browserslist}" >>"${GITHUB_OUTPUT}"
