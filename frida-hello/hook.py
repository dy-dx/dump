from __future__ import print_function
import frida
import sys

session = frida.attach("hello")

hook_script = session.create_script("""
Interceptor.attach(ptr("%s"), {
    onEnter: function(args) {
        send(args[0].toInt32());
    }
});
""" % int(sys.argv[1], 16))
def on_message(message, data):
    print(message)
hook_script.on('message', on_message)
hook_script.load()


modify_script = session.create_script("""
Interceptor.attach(ptr("%s"), {
    onEnter: function(args) {
        args[0] = ptr("1337");
    }
});
""" % int(sys.argv[1], 16))
# modify_script.load()


call_script = session.create_script("""
var f = new NativeFunction(ptr("%s"), 'void', ['int']);
f(1911);
f(1911);
f(1911);
""" % int(sys.argv[1], 16))
call_script.load()


sys.stdin.read()
