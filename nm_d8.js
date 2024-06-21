#!/usr/bin/env -S /home/user/.jsvu/engines/v8/v8 --enable-os-system
// d8 Native Messaging host
// guest271314 7-7-2023, 6-20-2024

function encodeMessage(str) {
    return new Uint8Array([...str].map((s) => s.codePointAt()));
  }
  
  function getMessage(pid) {
    try {
      // readline() doesn't read past the Uint32Array equivalent message length
      // V8 authors are not interested in reading STDIN to an ArrayBuffer in d8
      // https://groups.google.com/g/v8-users/c/NsnStT6bx3Y/m/Yr_Z1FwgAQAJ
      // Use dd to get message length and return message from Bash script
      const stdin = (os.system("./getNativeMessage.sh", [pid])).trim();
      return encodeMessage(stdin);
    } catch (e) {
      writeFile("getMessageError.txt", encodeMessage(e.message));
    }
  }
  
  function sendMessage(message) {
    const header = new Uint32Array([message.length]);
    writeFile("/proc/self/fd/1", header);
    writeFile("/proc/self/fd/1", message);
  }
  
  function main() {
    // Get PID of current process
    const pid = (os.system("pgrep", ["-n", "-f", os.d8Path])).replace(/\D+/g, "");
    while (true) {
      const message = getMessage(pid);
      sendMessage(message);
    }
  }
  
  try {
    main();
  } catch (e) {
    writeFile("mainError.txt", encodeMessage(e.message));
    quit();
  }