#!/usr/bin/env bash
# Provisionne le venv Data/ML opt-in (.venv-ds) pour le runtime python-ds (ADR-047).
# Idempotent. Ne commite jamais le venv (gitignoré). Nécessite un accès réseau.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m venv .venv-ds
./.venv-ds/bin/pip install --disable-pip-version-check -q -r requirements-ds.txt
./.venv-ds/bin/python -c "import numpy,pandas,sklearn;print('DS venv OK: numpy',numpy.__version__,'pandas',pandas.__version__,'sklearn',sklearn.__version__)"
