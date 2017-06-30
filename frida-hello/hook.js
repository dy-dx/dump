'use strict';
const frida = require('frida');

function agent() {
  Interceptor.attach(ptr('0x106863ed0'), {
    onEnter: function (args) {
      args[0] = ptr('1337');
    }
  });
}

async function main() {
  const session = await frida.attach('hello');
  const script = await session.createScript('(' + agent.toString() + ').call(this);');
  await script.load();
}

main().catch(console.error);
