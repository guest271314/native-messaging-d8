#!/usr/bin/env -S /home/user/bin/qjs -m --std
// Read stdin to V8's d8, send to d8
// const stdin = os.system("./read_d8_stdin.js", [`/proc/${pid.replace(/\D+/g, "")}/fd/0`]);
function read_d8_stdin([, path] = scriptArgs) {
  try {
    // Uint32Array to read message length into
    const size = new Uint32Array(1);
    const err = {
      errno: 0
    };
    // Open /proc/PID/fd/0 for reading
    const pipe = std.open(
      path,
      "rb",
      err,
    );
    if (err.errno !== 0) {
      throw `${std.strerror(err.errno)}: ${path}`;
    }
    // Read /proc/PID/fd/0 into Uint32Array
    pipe.read(size.buffer, 0, 4);
    // Uint8Array to read message into
    const output = new Uint8Array(size[0]);
    // Read /proc/PID/fd/0 into Uint8Array
    pipe.read(output.buffer, 0, output.length);
    // Uint8Array containing Uint32Array buffer in Uint8Array and Uint8Array containing message
    const data = new Uint8Array([...new Uint8Array(size.buffer), ...output]);
    // Write Uint8Array to d8's stdin
    std.out.write(data.buffer, 0, data.length);
    std.out.flush();
    // Exit and start again initiated from d8
    std.exit(0);
  } catch (e) {
    // Handle error
    const err = {
      errno: 0
    };
    const file = std.open("qjsErr.txt", "w", err);
    if (err.errno !== 0) {
      file.puts(JSON.stringify(err));
      file.close();
      std.exit(1);
    }
    file.puts(JSON.stringify(e));
    file.close();
    std.out.puts(JSON.stringify(err));
    std.exit(1);
  }
}

read_d8_stdin();
