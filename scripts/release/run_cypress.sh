#!/usr/bin/env bash
set -euo pipefail

max_attempts=3
log_file=$(mktemp)
trap 'rm -f "$log_file"' EXIT

for ((attempt = 1; attempt <= max_attempts; attempt++)); do
	echo "Cypress attempt ${attempt}/${max_attempts}"
	set +e
	npm run test -- "$@" 2>&1 | tee "$log_file"
	exit_codes=("${PIPESTATUS[@]}")
	set -e

	# A logging failure must not hide the command's result or trigger a retry.
	if ((exit_codes[1] != 0)); then
		exit "${exit_codes[1]}"
	fi
	exit_code=${exit_codes[0]}
	if ((exit_code == 0)); then
		exit 0
	fi

	# Cypress test retries cannot recover a lost browser control connection.
	# Only restart for this fatal CDP error, preserving test/config failures
	# and signal exits. Do not match the intermediate connection warnings.
	if ((exit_code >= 128)) ||
		! grep -Fq 'There was an error reconnecting to the Chrome DevTools protocol. Please restart the browser.' "$log_file" ||
		grep -Eq '[1-9][0-9]* failing' "$log_file"; then
		exit "$exit_code"
	fi

	if ((attempt == max_attempts)); then
		exit "$exit_code"
	fi

	echo "::warning::Cypress lost the browser connection; restarting in 5 seconds (attempt $((attempt + 1))/${max_attempts})."
	sleep 5
done
