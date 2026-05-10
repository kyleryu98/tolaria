#!/bin/sh
set -eu

node_major() {
  version="$("$1" --version 2>/dev/null || true)"
  version="${version#v}"
  major="${version%%.*}"
  case "$major" in
    ''|*[!0-9]*) echo 0 ;;
    *) echo "$major" ;;
  esac
}

stable_node_candidate() {
  candidate="$1"
  if [ -z "$candidate" ] || [ ! -x "$candidate" ]; then
    return 1
  fi

  major="$(node_major "$candidate")"
  if [ "$major" -ge 20 ] && [ "$major" -lt 25 ]; then
    printf '%s\n' "$candidate"
    return 0
  fi

  return 1
}

current_node="${TOLARIA_NODE:-node}"
current_major="$(node_major "$current_node")"
build_node="$current_node"

if [ "$current_major" -ge 25 ] && [ "${TOLARIA_BUILD_ALLOW_UNSTABLE_NODE:-0}" != "1" ]; then
  for candidate in \
    "${TOLARIA_STABLE_NODE:-}" \
    /opt/homebrew/opt/node@24/bin/node \
    /opt/homebrew/opt/node@22/bin/node \
    /opt/homebrew/opt/node@20/bin/node \
    /usr/local/opt/node@24/bin/node \
    /usr/local/opt/node@22/bin/node \
    /usr/local/opt/node@20/bin/node \
    "$HOME"/.nvm/versions/node/v24*/bin/node \
    "$HOME"/.nvm/versions/node/v22*/bin/node \
    "$HOME"/.nvm/versions/node/v20*/bin/node \
    /Users/yongtaek/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
  do
    if build_node_candidate="$(stable_node_candidate "$candidate")"; then
      build_node="$build_node_candidate"
      break
    fi
  done

  if [ "$build_node" = "$current_node" ]; then
    echo "Vite production builds are not stable under Node $("$current_node" --version); install Node 24, 22, or 20, or set TOLARIA_STABLE_NODE=/path/to/node." >&2
    exit 1
  fi

  echo "[build-node] using $build_node because Node $("$current_node" --version) is not supported for this build"
fi

exec "$build_node" scripts/build-vite-stable.mjs
