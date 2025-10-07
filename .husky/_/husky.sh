#!/bin/sh
# Husky shell helper

if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && echo "$1"
  }

  readonly hookname="$1"
  debug "husky:debug current working directory is: $(pwd)"
  export readonly husky_skip_init=1
  sh -e "$0" "${hookname}"
  exitCode="$?"
  debug "husky:debug exit code: $exitCode"
  exit $exitCode
fi
