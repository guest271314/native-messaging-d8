#!/bin/bash
# Bash Native Messaging host
# Read STDIN for V8's d8 shell, return message to d8
# guest271314 2024

set -x
set -o posix

getNativeMessage() {
  # https://lists.gnu.org/archive/html/help-bash/2023-06/msg00036.html
  length=$(dd iflag=fullblock oflag=nocache conv=notrunc,fdatasync bs=4 count=1 if=/proc/$@/fd/0 | od -An -td4 -)
  message=$(dd iflag=fullblock oflag=nocache conv=notrunc,fdatasync bs=$((length)) count=1 if=/proc/$@/fd/0)
  # length=$(head -q -z --bytes=4 /proc/$@/fd/0 | od -An -td4 -)
  # message=$(head -q -z --bytes=$((length)) /proc/$@/fd/0)
  echo "$message" 
}

getNativeMessage "$1"
