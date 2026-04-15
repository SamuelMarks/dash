import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";

const term = new Terminal({
  cursorBlink: true,
  fontFamily: "monospace",
  fontSize: 14,
  theme: { background: "#1e1e1e" },
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.loadAddon(new WebLinksAddon());

const container = document.getElementById("terminal-container")!;
term.open(container);
fitAddon.fit();

window.addEventListener("resize", () => fitAddon.fit());

term.writeln("Welcome to \x1b[1;32mdash\x1b[0m compiled to WebAssembly!");
term.writeln("Loading shell in Web Worker...");

const worker = new Worker("./worker.js");

let inputBuffer = "";
let commandHistory: string[] = [];
let historyIndex = 0;
let isRawMode = false;

worker.onmessage = (e) => {
  const msg = e.data;
  console.log("WORKER MSG:", msg.type, typeof msg.data, msg.data);
  switch (msg.type) {
    case "SET_RAW_MODE":
      isRawMode = msg.data;
      break;
    case "UPDATE_LOCALSTORAGE":
      localStorage.setItem(msg.key, msg.value);
      break;
    case "DELETE_LOCALSTORAGE":
      localStorage.removeItem(msg.key);
      break;
    case "LOADED":
      term.writeln(
        "Shell loaded. Try reading or writing to /sys/fs/localstorage to interact with the browser's localStorage.\r\n",
      );
      const initialLocalStorage: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) initialLocalStorage[k] = localStorage.getItem(k) || "";
      }
      worker.postMessage({
        type: "INIT_LOCALSTORAGE",
        data: initialLocalStorage,
      });

      if (window.location.search.includes("test=1")) {
        worker.postMessage({ type: "TEST_CMD" });
      }
      break;
    case "CLIPBOARD_WRITE":
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(msg.data)
          .then(() => {
            worker.postMessage({ type: "CLIPBOARD_WRITE_ACK" });
          })
          .catch((err) => {
            console.error("Clipboard write failed:", err);
            worker.postMessage({ type: "CLIPBOARD_WRITE_ACK" });
          });
      } else {
        console.warn("Clipboard API not available");
        worker.postMessage({ type: "CLIPBOARD_WRITE_ACK" });
      }
      break;
    case "CLIPBOARD_READ":
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard
          .readText()
          .then((text) => {
            worker.postMessage({ type: "CLIPBOARD_READ_ACK", data: text });
          })
          .catch((err) => {
            console.error("Clipboard read failed:", err);
            worker.postMessage({ type: "CLIPBOARD_READ_ACK", data: "" });
          });
      } else {
        console.warn("Clipboard API not available");
        worker.postMessage({ type: "CLIPBOARD_READ_ACK", data: "" });
      }
      break;
    case "STDOUT":
      term.write(msg.data.replace(/\n/g, "\r\n") + "\r\n");
      break;
    case "STDERR":
      term.write("\x1b[31m" + msg.data.replace(/\n/g, "\r\n") + "\x1b[0m\r\n");
      break;
    case "STDOUT_CHAR":
      const char = String.fromCharCode(msg.data);
      if (char === "\n") term.write("\r\n");
      else term.write(char);
      break;
  }
};

term.onData((e) => {
  if (isRawMode) {
    const charCodes = [];
    for (let i = 0; i < e.length; i++) {
      charCodes.push(e.charCodeAt(i));
    }
    worker.postMessage({ type: "INPUT", data: charCodes });
    return;
  }

  if (e === "\x1b[A") {
    // Up arrow

    if (historyIndex > 0) {
      for (let i = 0; i < inputBuffer.length; i++) term.write("\b \b");
      historyIndex--;
      inputBuffer = commandHistory[historyIndex];
      term.write(inputBuffer);
    }
    return;
  } else if (e === "\x1b[B") {
    // Down arrow
    if (historyIndex < commandHistory.length) {
      for (let i = 0; i < inputBuffer.length; i++) term.write("\b \b");
      historyIndex++;
      if (historyIndex === commandHistory.length) {
        inputBuffer = "";
      } else {
        inputBuffer = commandHistory[historyIndex];
      }
      term.write(inputBuffer);
    }
    return;
  }

  // Ignore escape sequences (e.g., arrow keys) since we are in basic canonical mode
  if (e.startsWith("\x1b")) return;

  const charCodes = [];
  for (let i = 0; i < e.length; i++) {
    const char = e.charAt(i);
    const charCode = e.charCodeAt(i);

    if (charCode === 13) {
      // Enter
      term.write("\r\n");
      if (inputBuffer.trim().length > 0) {
        commandHistory.push(inputBuffer);
      }
      historyIndex = commandHistory.length;
      inputBuffer += "\n";
      for (let j = 0; j < inputBuffer.length; j++) {
        charCodes.push(inputBuffer.charCodeAt(j));
      }
      worker.postMessage({ type: "INPUT", data: charCodes });
      inputBuffer = "";
      charCodes.length = 0;
    } else if (charCode === 127 || charCode === 8) {
      // Backspace or Ctrl+H
      if (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1);
        term.write("\b \b");
      }
    } else if (charCode === 21) {
      // Ctrl+U (Clear line)
      while (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1);
        term.write("\b \b");
      }
    } else if (charCode === 23) {
      // Ctrl+W (Erase word)
      // Erase trailing spaces
      while (inputBuffer.length > 0 && inputBuffer.endsWith(" ")) {
        inputBuffer = inputBuffer.slice(0, -1);
        term.write("\b \b");
      }
      // Erase word characters
      while (inputBuffer.length > 0 && !inputBuffer.endsWith(" ")) {
        inputBuffer = inputBuffer.slice(0, -1);
        term.write("\b \b");
      }
    } else if (charCode === 3) {
      // Ctrl+C
      term.write("^C\r\n");
      inputBuffer = "";
      worker.postMessage({ type: "INPUT", data: [3] });
    } else if (charCode === 4) {
      // Ctrl+D
      if (inputBuffer.length === 0) {
        worker.postMessage({ type: "INPUT", data: [4] });
      }
    } else if (charCode >= 32 && charCode <= 126) {
      // Normal printable char
      inputBuffer += char;
      term.write(char);
    }
  }
});
