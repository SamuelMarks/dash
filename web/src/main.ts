/**
 * Web terminal main entry point mapping xterm.js interactions
 * to a background Web Worker running the WebAssembly dash shell.
 * It manages terminal resizing, OPFS/IndexedDB storage feedback,
 * clipboard sync, and direct input buffering to avoid blocking the UI.
 */
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

const worker = new Worker("./worker.js");

term.onResize((size) => {
  worker.postMessage({ type: "RESIZE", cols: size.cols, rows: size.rows });
});

function handleResize() {
  fitAddon.fit();
}

window.addEventListener("resize", () => handleResize());
handleResize();

term.writeln("Welcome to \x1b[1;32mdash\x1b[0m compiled to WebAssembly!");
term.writeln("Loading shell in Web Worker...");

let inputBuffer = "";
let commandHistory: string[] = [];
let historyIndex = 0;
let isRawMode = false;
let cursorPos = 0;

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
    case "OPFS_LOADED":
      // OPFS loaded successfully, no need to print and disrupt shell output tests
      break;
    case "LOADED":
      term.writeln(
        "Shell loaded.\r\n" +
          " - /sys/fs/localstorage: Maps to browser localStorage (small config).\r\n" +
          " - /home/web_user: Maps to IndexedDB (persists across reloads).\r\n" +
          " - /home/opfs: Maps to Origin Private File System (high performance).\r\n",
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
      while (cursorPos < inputBuffer.length) {
        term.write("\x1b[C");
        cursorPos++;
      }
      for (let i = 0; i < inputBuffer.length; i++) term.write("\b \b");
      historyIndex--;
      inputBuffer = commandHistory[historyIndex];
      cursorPos = inputBuffer.length;
      term.write(inputBuffer);
    }
    return;
  } else if (e === "\x1b[B") {
    // Down arrow
    if (historyIndex < commandHistory.length) {
      while (cursorPos < inputBuffer.length) {
        term.write("\x1b[C");
        cursorPos++;
      }
      for (let i = 0; i < inputBuffer.length; i++) term.write("\b \b");
      historyIndex++;
      if (historyIndex === commandHistory.length) {
        inputBuffer = "";
      } else {
        inputBuffer = commandHistory[historyIndex];
      }
      cursorPos = inputBuffer.length;
      term.write(inputBuffer);
    }
    return;
  } else if (e === "\x1b[C") {
    // Right arrow
    if (cursorPos < inputBuffer.length) {
      cursorPos++;
      term.write("\x1b[C");
    }
    return;
  } else if (e === "\x1b[D") {
    // Left arrow
    if (cursorPos > 0) {
      cursorPos--;
      term.write("\x1b[D");
    }
    return;
  } else if (e === "\x1b[H" || e === "\x1bOH" || e === "\x1b[1~") {
    // Home
    while (cursorPos > 0) {
      term.write("\x1b[D");
      cursorPos--;
    }
    return;
  } else if (e === "\x1b[F" || e === "\x1bOF" || e === "\x1b[4~") {
    // End
    while (cursorPos < inputBuffer.length) {
      term.write("\x1b[C");
      cursorPos++;
    }
    return;
  } else if (e === "\x1b[3~") {
    // Delete
    if (cursorPos < inputBuffer.length) {
      const before = inputBuffer.slice(0, cursorPos);
      const after = inputBuffer.slice(cursorPos + 1);
      inputBuffer = before + after;
      term.write(after + " ");
      for (let j = 0; j <= after.length; j++) term.write("\x1b[D");
    }
    return;
  }

  // Ignore other escape sequences in basic canonical mode
  if (e.startsWith("\x1b")) return;

  const charCodes = [];
  for (let i = 0; i < e.length; i++) {
    const char = e.charAt(i);
    const charCode = e.charCodeAt(i);

    if (charCode === 13) {
      // Enter
      while (cursorPos < inputBuffer.length) {
        term.write("\x1b[C");
        cursorPos++;
      }
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
      cursorPos = 0;
    } else if (charCode === 127 || charCode === 8) {
      // Backspace or Ctrl+H
      if (cursorPos > 0) {
        const before = inputBuffer.slice(0, cursorPos - 1);
        const after = inputBuffer.slice(cursorPos);
        inputBuffer = before + after;
        cursorPos--;
        term.write("\b" + after + " ");
        for (let j = 0; j <= after.length; j++) term.write("\x1b[D");
      }
    } else if (charCode === 1) {
      // Ctrl+A (Home)
      while (cursorPos > 0) {
        term.write("\x1b[D");
        cursorPos--;
      }
    } else if (charCode === 5) {
      // Ctrl+E (End)
      while (cursorPos < inputBuffer.length) {
        term.write("\x1b[C");
        cursorPos++;
      }
    } else if (charCode === 11) {
      // Ctrl+K (Kill to end of line)
      if (cursorPos < inputBuffer.length) {
        const removed = inputBuffer.slice(cursorPos);
        inputBuffer = inputBuffer.slice(0, cursorPos);
        term.write(" ".repeat(removed.length));
        for (let j = 0; j < removed.length; j++) term.write("\x1b[D");
      }
    } else if (charCode === 21) {
      // Ctrl+U (Clear line from cursor to beginning)
      if (cursorPos > 0) {
        const removed = inputBuffer.slice(0, cursorPos);
        const after = inputBuffer.slice(cursorPos);
        for (let j = 0; j < cursorPos; j++) term.write("\x1b[D");
        term.write(after + " ".repeat(removed.length));
        for (let j = 0; j < after.length + removed.length; j++)
          term.write("\x1b[D");
        inputBuffer = after;
        cursorPos = 0;
      }
    } else if (charCode === 23) {
      // Ctrl+W (Erase word)
      if (cursorPos > 0) {
        let removeStart = cursorPos;
        while (removeStart > 0 && inputBuffer[removeStart - 1] === " ")
          removeStart--;
        while (removeStart > 0 && inputBuffer[removeStart - 1] !== " ")
          removeStart--;
        const removedLen = cursorPos - removeStart;
        const before = inputBuffer.slice(0, removeStart);
        const after = inputBuffer.slice(cursorPos);

        for (let j = 0; j < removedLen; j++) term.write("\x1b[D");
        term.write(after + " ".repeat(removedLen));
        for (let j = 0; j < after.length + removedLen; j++)
          term.write("\x1b[D");

        inputBuffer = before + after;
        cursorPos = removeStart;
      }
    } else if (charCode === 3) {
      // Ctrl+C
      while (cursorPos < inputBuffer.length) {
        term.write("\x1b[C");
        cursorPos++;
      }
      term.write("^C\r\n");
      inputBuffer = "";
      cursorPos = 0;
      worker.postMessage({ type: "INPUT", data: [3] });
    } else if (charCode === 4) {
      // Ctrl+D
      if (inputBuffer.length === 0) {
        worker.postMessage({ type: "INPUT", data: [4] });
      }
    } else if (charCode >= 32 && charCode <= 126) {
      // Normal printable char
      const before = inputBuffer.slice(0, cursorPos);
      const after = inputBuffer.slice(cursorPos);
      inputBuffer = before + char + after;
      cursorPos++;
      term.write(char + after);
      for (let j = 0; j < after.length; j++) term.write("\x1b[D");
    }
  }
});
