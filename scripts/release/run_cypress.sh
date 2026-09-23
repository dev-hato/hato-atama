#!/usr/bin/env bash
set -e

for attempt in 1 2 3 4; do
	if npm run test -- "$@"; then
		exit 0
	else
		exit_code=$?
	fi

	if ((attempt == 4)); then
		exit "$exit_code"
	fi

	echo "::warning::Cypress failed; retrying in 5 seconds (attempt $((attempt + 1))/4)."
	sleep 5
done
