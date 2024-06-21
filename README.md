d8 Native Messaging Host

Installation and usage on Chrome and Chromium

1. Navigate to `chrome://extensions`.
2. Toggle `Developer mode`.
3. Click `Load unpacked`.
4. Select `native-messaging-d8` folder.
5. Note the generated extension ID.
6. Open `nm_d8.json` in a text editor, set `"path"` to absolute path of `nm_d8.js` and `chrome-extension://<ID>/` using ID from 5 in `"allowed_origins"` array. 
7. Copy the file to Chrome or Chromium configuration folder, e.g., Chromium on \*nix `~/.config/chromium/NativeMessagingHosts`; Chrome dev channel on \*nix `~/.config/google-chrome-unstable/NativeMessagingHosts`; and similar for Chrome For Testing.
8. Make sure `nm_d8.js` and the included Bash script `getNativeMessage.sh` (see Notes) is executable. To download V8 using [`jsvu`](https://github.com/GoogleChromeLabs/jsvu)

```
bun install jsvu
./node_modules/.bin/jsvu --os=linux64 --engines=v8
```
and use the appropriate path to the `v8` executable

```
#!/usr/bin/env -S /home/user/.jsvu/engines/v8/v8
```
9. To test click `service worker` link in panel of unpacked extension which is DevTools for background.js in MV3 `ServiceWorker`, observe echo'ed message from `d8` Native Messaging host. The communication mechanism can be extended to run V8 via `d8` from any arbitrary Web page using various means, including, but not limited to utilizing `"externally_connectable"` to message and from the `ServiceWorker` on specific Web pages over IPC; `"web_accessible_resources"` to append an extension `iframe` to any document and use `postMessage()` to transfer messages using `postMessage()`; an offscreen document or side-panel document to connect to the host and transfer messages back and forth to the arbitrary Web page in the browser, et al.

### Notes

[d8](https://v8.dev/docs/d8) does not expect to be used as a Native Messaging host. 

Standard input and standard output are not specified by ECMA-262. 

V8 maintainers do not currently appear to be interested in extending `d8` capabilities, or the idea of standardizing reading STDIN for JavaScript. See [Implement reading STDIN to an ArrayBuffer. Precedent: `writeFile("/proc/self/fd/1")`](https://groups.google.com/g/v8-users/c/NsnStT6bx3Y/m/Yr_Z1FwgAQAJ)

We work around this in the `d8` shell by using [`os.system()`](https://source.chromium.org/chromium/chromium/src/+/main:v8/src/d8/d8.h;l=647) with [`pgrep`](https://man7.org/linux/man-pages/man1/pgrep.1.html) command to get the PID of the current process, then 
[`dd`](https://www.gnu.org/software/coreutils/manual/html_node/dd-invocation.html#dd-invocation) command to read `/proc/$@/fd/0`, then echo the STDIN to the current `d8` process to `d8`. 

### Compatibility

For differences between OS and browser implementations see [Chrome incompatibilities](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#native_messaging).

# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
