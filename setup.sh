if ! [[ "${BASH_SOURCE[0]}" != "$0" ]]; then
  echo "This script must be sourced, not executed directly."
  echo "Run 'source setup.sh' instead."
  exit 1
fi

if ! command -v pyenv >/dev/null 2>&1; then
  echo "pyenv not found, installing..."
  curl -fsSL https://pyenv.run | bash
fi

command -v poetry > /dev/null 2>&1
poetry_command_exists=$?
poetry --version > /dev/null 2>&1
poetry_installed_for_active_python=$?
# Poetry doesn't exist at all, or exists but not for the active python version
if [[ $poetry_command_exists -ne 0 || $poetry_installed_for_active_python -ne 0 ]]; then
  echo "Poetry not found, installing..."
  pip install poetry
fi
# shellcheck disable=SC2002
cat .python-version | xargs pyenv install
python -m venv ./.venv && source ./.venv/bin/activate
poetry lock && poetry install
if ! [ -f .env ]; then
  echo ".env file not found, copying sample.env to .env"
  cp sample.env .env
  echo "Please edit the .env file with appropriate values."
fi
# These hooks will update dependencies and rebuild code in the Node app
# anytime a change is pulled, so it doesn't have to be done manually.
echo "Setting up Git hooks..."
git config --local core.hooksPath scripts/git_hooks
git_hooks/post-merge
echo "Setup complete."