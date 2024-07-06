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
      // Use QuickJS to get message length and return message from Bash script
      // Read stdin to V8's d8, send to d8
      const stdin = os.system("./read_d8_stdin.js", [`/proc/${pid.replace(/\D+/g, "")}/fd/0`]);
      if (stdin != undefined && stdin != null && stdin.length) {
        const data = encodeMessage(stdin)
        const view = new DataView(data.subarray(0, 4).buffer);
        const length = view.getUint32(0, true);
        sendMessage(encodeMessage(JSON.stringify({ length })));
        const message = data.subarray(4);
        return message;
     } 
     throw stdin;
    } catch (e) {
      const err = encodeMessage(JSON.stringify(`${e.message.slice(0, 26)}: ${read("qjsErr.txt").slice(1, -1)}`));
      sendMessage(err); 
      writeFile("err.txt", err);
      quit(1);
    }
  }
  
  function sendMessage(message) {
    const header = new Uint32Array([message.length]);
    writeFile("/proc/self/fd/1", header);
    writeFile("/proc/self/fd/1", message);
  }
  
  function main() {
    // Get PID of current process
    const pid = os.system("pgrep", ["-n", "-f", os.d8Path]);
    // Get PPID of current process
    const ppid = os.system("ps", ["-o", "ppid=", "-p", JSON.parse(pid)]);
    while (true) {
      // Terminate current process when chrome processes close
      if (!(os.system("pgrep", ["-P", JSON.parse(ppid)]))) {
        break;
      }
      const message = getMessage(pid, reads++);
      if (message) {
        sendMessage(message);
      }
    }
  }
  
  try {
    main();
  } catch (e) {
    writeFile("mainError.txt", encodeMessage(e.message));
    quit();
  }
