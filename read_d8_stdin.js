#!/usr/bin/env -S /home/user/bin/qjs -m --std
 // Read stdin to V8's d8, send to d8
// const stdin = os.system("./read_d8_stdin.js", [`/proc/${pid.replace(/\D+/g, "")}/fd/0`]);
function read_d8_stdin([, path] = scriptArgs) {
  try {
    const size = new Uint32Array(1);
    const err = {
      errno: 0
    };
    const pipe = std.open(
      path,
      "rb",
      err,
    );
    if (err.errno !== 0) {
      throw `${std.strerror(err.errno)}: ${path}`;
    }
    pipe.read(size.buffer, 0, 4);
    const output = new Uint8Array(size[0]);
    pipe.read(output.buffer, 0, output.length);
    const data = new Uint8Array([...new Uint8Array(size.buffer), ...output]);
    std.out.write(data.buffer, 0, data.length);
    std.out.flush();
    std.exit(0);
  } catch (e) {
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