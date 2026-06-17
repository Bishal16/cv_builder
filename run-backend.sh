#!/usr/bin/env bash
# Starts the backend with the root .env loaded into the environment.
# Spring Boot does NOT read .env on its own, so use this instead of running
# `mvn spring-boot:run` directly — otherwise LLM_PROVIDER / API keys are unset.
set -euo pipefail
cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
  echo "Loaded .env (LLM_PROVIDER=${LLM_PROVIDER:-<unset>})"
else
  echo "WARNING: no .env found at project root — AI/OAuth features may be disabled."
fi

cd backend
exec mvn spring-boot:run
