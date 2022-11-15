#!/usr/bin/env bash

bash "${GITHUB_WORKSPACE}/scripts/release/change_file_and_env.sh"
dockle_version="$(cat .dockle-version)"
curl -L -o dockle.deb "https://github.com/goodwithtech/dockle/releases/download/v${dockle_version}/dockle_${dockle_version}_Linux-64bit.deb"
sudo dpkg -i dockle.deb
docker compose -f docker-compose.yml -f "${DOCKER_COMPOSE_FILE_NAME}" pull "${SERVICE_NAME}"
docker compose -f docker-compose.yml -f "${DOCKER_COMPOSE_FILE_NAME}" up -d "${SERVICE_NAME}"

for image_name in $(docker compose -f docker-compose.yml -f "${DOCKER_COMPOSE_FILE_NAME}" images "${SERVICE_NAME}" | awk 'OFS=":" {print $2,$3}' | tail -n +2); do
  cmd="dockle --exit-code 1 "

  if [[ "${image_name}" =~ "gcloud_datastore" ]] || [[ "${image_name}" =~ "server-dev" ]]; then
    cmd+="-i DKL-LI-0003 "
    if [[ "${image_name}" =~ "gcloud_datastore" ]]; then
      cmd+="-af settings.py -i CIS-DI-0001 "
    else
      cmd+="-af credentials --timeout 600s "
    fi
  elif [[ "${image_name}" =~ "frontend:" ]]; then
    cmd+="-ak NGINX_GPGKEY "
  elif [[ "${image_name}" =~ "frontend-base" ]]; then
    cmd+="-i CIS-DI-0006 "
  fi

  cmd+="${image_name}"
  echo "> ${cmd}"
  eval "${cmd}"
done
