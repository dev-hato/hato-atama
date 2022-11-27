#!/usr/bin/env bash

workflows_dir=.github/workflows
fail_notify_workflow_file="${workflows_dir}/fail-notify.yml"
workflows="$(find "${workflows_dir}" -not -path "${fail_notify_workflow_file}" -type f -exec yq '.name' {} \; | sort | sed -e 's/^\(.*\)$/"\1"/g' | tr '\n' ',' | sed -e 's/,$//g')"
yq -i ".on.workflow_run.workflows=[${workflows}]" "${fail_notify_workflow_file}"
diff="$(git diff)"
echo "${diff}"
diff="${diff//'%'/'%25'}"
diff="${diff//$'\n'/'%0A'}"
diff="${diff//$'\r'/'%0D'}"
echo "diff=${diff}" >>"${GITHUB_OUTPUT}"
