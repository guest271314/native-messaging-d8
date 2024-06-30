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
      // #!/usr/bin/env -S /home/user/bin/qjs -m --std
      // Read stdin to V8's d8, send to d8
      // const stdin = os.system("./read_d8_stdin.js", [`/proc/${pid.replace(/\D+/g, "")}/fd/0`]);
      // function read_d8_stdin([, path] = scriptArgs) {
      //  try {
      //    const size = new Uint32Array(1);
      //    const err = { errno: 0 };
      //    const pipe = std.open(
      //      path,
      //      "rb",
      //      err,
      //    );
      //    if (err.errno !== 0) {
      //      throw `${std.strerror(err.errno)}: ${path}`;
      //    }
      //    pipe.read(size.buffer, 0, 4);
      //    const output = new Uint8Array(size[0]);
      //    pipe.read(output.buffer, 0, output.length);
      //    std.out.write(output.buffer, 0, output.length);
      //    std.out.flush();
      //    std.exit(0);
      // } catch (e) {
      //     const err = { errno: 0 };
      //     const file = std.open("qjsErr.txt", "w", err);
      //     if (err.errno !== 0) {
      //       file.puts(JSON.stringify(err));
      //       file.close();
      //       std.exit(1);
      //     }
      //     file.puts(JSON.stringify(e));
      //     file.close();
      //     std.out.puts(JSON.stringify(err));
      //     std.exit(1);
      //   }
      // }
      //
      // read_d8_stdin();
      const stdin = os.system("./read_d8_stdin.js", [`/proc/${pid.replace(/\D+/g, "")}/fd/0`]);
      if (stdin != undefined && stdin != null && stdin.length) {
        const message = encodeMessage(stdin.trim());
        // https://stackoverflow.com/a/58288413
        // const header = new Uint32Array([
        //  ((uint32) =>
        //    (uint32[3] << 24) |
        //    (uint32[2] << 16) |
        //    (uint32[1] << 8) |
        //    (uint32[0]))(Array.from({
        //    length: 4,
        //    }, (_, index) => (message.length >> (index * 8)) & 0xff)),
        // ]);
        // writeFile("messageLength.txt", encodeMessage(JSON.stringify(header)));
        return encodeMessage(stdin);
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
