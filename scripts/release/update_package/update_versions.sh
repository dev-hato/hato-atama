#!/usr/bin/env bash
set -e

for path in "frontend" "test/e2e" "."; do
	echo "${NODE_VERSION}" >${path}/.node-version

	NODE_PATTERN="s/\"node\": \".*\"/\"node\": \"^${DEPENDABOT_NODE_VERSION}"

	if [ "${DEPENDABOT_NODE_VERSION}" != "${NODE_VERSION}" ]; then
		NODE_PATTERN+=" || ^${NODE_VERSION}"
	fi

	NODE_PATTERN+="\"/g"
	sed -i -e "${NODE_PATTERN}" ${path}/package.json

	NPM_PATTERN="s/\"npm\": \".*\"/\"npm\": \"^${DEPENDABOT_NPM_VERSION}"

	if [ "${DEPENDABOT_NPM_VERSION}" != "${NPM_VERSION}" ]; then
		NPM_PATTERN+=" || ^${NPM_VERSION}"
	fi

	NPM_PATTERN+="\"/g"
	sed -i -e "${NPM_PATTERN}" ${path}/package.json
done

tag_name="$(yq '.jobs.super-linter.steps[-1].uses' .github/workflows/super-linter.yml | sed -e 's;/slim@.*;:slim;g')"
tag_version="$(yq '.jobs.super-linter.steps[-1].uses | line_comment' .github/workflows/super-linter.yml)"
eslint_version="$(docker run --rm --entrypoint '' "ghcr.io/${tag_name}-${tag_version}" /bin/sh -c 'eslint -v' | sed -e 's/^v//g')"
yq -i ".devDependencies.eslint|=\"$eslint_version\"" test/e2e/package.json
