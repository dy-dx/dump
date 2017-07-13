'use strict';
const frida = require('frida');

function agent() {
  // const pointer = ptr('0x106863ed0');
  const pointer = Module.findExportByName(null, 'f');
  Interceptor.attach(pointer, {
    onEnter: function (args) {
      args[0] = ptr('1337');
    }
  });

  rpc.exports = {
    add: function (a, b) {
      return a + b;
    },
    sub: function (a, b) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(a - b);
        }, 100);
      });
    }
  };

  send(123);

  recv('poke', function onMessage(pokeMessage) {
    send('pokeBack');
  });
}

async function main() {
  const session = await frida.attach('hello');
  const script = await session.createScript('(' + agent.toString() + ').call(this);');
  script.events.listen('message', (message, data) => {
    console.log(message);
  });

  await script.load();

  await script.post({ type: 'poke' });

  const api = await script.getExports();
  console.log(await api.add(2, 3));
  console.log(await api.sub(5, 3));
}

main().catch(console.error);
