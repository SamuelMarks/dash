#!/bin/bash
set -e
source ./emsdk/emsdk_env.sh

make clean || true

if [ "$DEBUG" = "1" ]; then
  echo "Building in DEBUG mode..."
  export CFLAGS="-O0 -g -gsource-map -D_GNU_SOURCE"
  export LDFLAGS="-O0 -gsource-map --source-map-base http://localhost:5173/ -s ASSERTIONS=1 -s ASYNCIFY=1 -s ASYNCIFY_IMPORTS=dash_async_read,invoke_* -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_RUNTIME_METHODS=ccall,cwrap,FS,TTY,IDBFS,Asyncify,UTF8ToString -s EXPORTED_FUNCTIONS=_main -s FORCE_FILESYSTEM=1 -lidbfs.js --js-library $(pwd)/web/library_dash.js"
else
  echo "Building in RELEASE mode..."
  export CFLAGS="-O3 -flto -D_GNU_SOURCE"
  export LDFLAGS="-O3 -flto -s ASYNCIFY=1 -s ASYNCIFY_IMPORTS=dash_async_read,invoke_* -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_RUNTIME_METHODS=ccall,cwrap,FS,TTY,IDBFS,Asyncify,UTF8ToString -s EXPORTED_FUNCTIONS=_main -s FORCE_FILESYSTEM=1 -lidbfs.js --js-library $(pwd)/web/library_dash.js"
fi

emconfigure ./configure --host=wasm32-unknown-emscripten

make CC_FOR_BUILD=cc CFLAGS_FOR_BUILD= LDFLAGS_FOR_BUILD= -j$(sysctl -n hw.ncpu)

cp src/dash web/public/dash.js
cp src/dash.wasm web/public/dash.wasm
if [ "$DEBUG" = "1" ]; then
  cp src/dash.wasm.map web/public/dash.wasm.map || true
fi
