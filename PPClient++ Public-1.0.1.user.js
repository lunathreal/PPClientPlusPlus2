// ==UserScript==
// @name         PPClient++ Public
// @description  Pixel Place Client
// @version      1.0.1
// @author       0vC4 + Azti
// @namespace    Hidden
// @match        https://pixelplace.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pixelplace.io
// @require      https://pixelplace.io/js/jquery.min.js?v2=1
// @require      https://pixelplace.io/js/jquery-ui.min.js?v2=1
// @require      https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.1.0/chroma.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/xterm/3.14.5/xterm.min.js
// @license      ©BY-NC-SA
// @grant        none
// @run-at       document-start
// ==/UserScript==

console.log('Loading PPC...');

function addCss(cssCode) {
  var styleElement = document.createElement("style");
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = cssCode;
  } else {
    styleElement.appendChild(document.createTextNode(cssCode));
  }
  document.getElementsByTagName("head")[0].appendChild(styleElement);
}

/**
 * @param {string} url
 */
async function $import(url) {
  let css = await fetch(url).then((x) => x.text());
  addCss(css);
}

/**
 * @param {string} url
 */
async function $require(url) {
  let js = await fetch(url).then((x) => x.text());
  Function(js)();
}

let IJAzti = {
  cImport: $import,
  jRequire: $require,
};
window["IJAzti"] = IJAzti;

Function.prototype.clone = function() {
    var that = this;
    var temp = function temporary() { return that.apply(this, arguments); };
    for(var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};

IJAzti.jRequire(
    "https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.1.2/chroma.min.js"
);
IJAzti.cImport(
    "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css"
);
IJAzti.cImport("https://unpkg.com/xterm@4.15.0-beta.10/css/xterm.css");

Object.defineProperty(document.body, 'innerHTML', {});
XMLHttpRequest.prototype._open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(_, url){
    if (url.includes('post-logout.php')) throw 'lol';
    return this._open(...arguments);
}
console.log('Loading Worker...');
window.WorkerTimer = (function() {
  const global = window;
  var TIMER_WORKER_SOURCE = [
    "var timerIds = {}, _ = {};",
    "_.setInterval = function(args) {",
    "  timerIds[args.timerId] = setInterval(function() { postMessage(args.timerId); }, args.delay);",
    "};",
    "_.clearInterval = function(args) {",
    "  clearInterval(timerIds[args.timerId]);",
    "};",
    "_.setTimeout = function(args) {",
    "  timerIds[args.timerId] = setTimeout(function() { postMessage(args.timerId); }, args.delay);",
    "};",
    "_.clearTimeout = function(args) {",
    "  clearTimeout(timerIds[args.timerId]);",
    "};",
    "onmessage = function(e) { _[e.data.type](e.data) };"
  ].join("");

  var _timerId = 0;
  var _callbacks = {};
  var _timer = new global.Worker(global.URL.createObjectURL(
    new global.Blob([ TIMER_WORKER_SOURCE ], { type: "text/javascript" })
  ));

  _timer.onmessage = function(e) {
    if (_callbacks[e.data]) {
      _callbacks[e.data].callback.apply(null, _callbacks[e.data].params);
    }
  };

  return {
    setInterval: function(callback, delay) {
      var params = Array.prototype.slice.call(arguments, 2);

      _timerId += 1;

      _timer.postMessage({ type: "setInterval", timerId: _timerId, delay: delay });
      _callbacks[_timerId] = { callback: callback, params: params };

      return _timerId;
    },
    setTimeout: function(callback, delay) {
      var params = Array.prototype.slice.call(arguments, 2);

      _timerId += 1;

      _timer.postMessage({ type: "setTimeout", timerId: _timerId, delay: delay });
      _callbacks[_timerId] = { callback: callback, params: params };

      return _timerId;
    },
    clearInterval: function(timerId) {
      _timer.postMessage({ type: "clearInterval", timerId: timerId });
      _callbacks[timerId] = null;
    },
    clearTimeout: function(timerId) {
      _timer.postMessage({ type: "clearTimeout", timerId: timerId });
      _callbacks[timerId] = null;
    }
  };
})();

const CWSS = (() => {
    const CWSS = window.CWSS || {};
    if (CWSS.ws) return CWSS;





    const proto = WebSocket.prototype;
    const def = Object.defineProperty;
    const rebase = (obj, key, list) => def(obj, key, {
        configurable: true,
        enumerable: true,
        set: func => list.push(func)
    });
    const native = (obj, value) => {
        obj.toString = function() {
            return Function.toString.call(value, ...arguments);
        };
    };





    const pipe = (type, ...next) => async function() {
        for (const hook of CWSS.hooks.sort((a, b) => b.priority - a.priority)) {
            if (!hook[type]) continue;
            if (!arguments) break;
            arguments = await hook[type].call(this, ...arguments);
        }

        if (!arguments) return;
        next.flat().forEach(func => func.call(this, ...arguments));
    };
    const pipeSync = type => function() {
        for (const hook of CWSS.hooks.sort((a, b) => b.priority - a.priority)) {
            if (!hook[type]) continue;
            if (!arguments) break;
            arguments = hook[type].call(this, ...arguments);
        }
        return arguments;
    };





    CWSS.ws = window.WebSocket;
    CWSS.send = proto.send;
    CWSS.addList = proto.addEventListener;

    CWSS.sockets = [];
    CWSS.hooks = [];
    CWSS.setHook = hook => {
        CWSS.hooks.push(hook);
        return CWSS;
    };
    CWSS.setHooks = (...hooks) => {
        CWSS.hooks.push(...hooks.flat());
        return CWSS;
    };





    proto.send = pipe('send', CWSS.send);
    proto.addEventListener = function() {
        const type = arguments[0];
        const func = arguments[1];
        const list = this.listeners[type];
        if (list) list.push(func);
        else CWSS.addList.call(this, ...arguments);
    };





    window.WebSocket = function() {
        arguments = pipeSync('args').call(this, ...arguments);
        const ws = new CWSS.ws(...arguments);

        for (const hook of CWSS.hooks.sort((a, b) => b.priority - a.priority))
            Object.assign(hook, {
                ws,
                async sendServer(data) {
                    CWSS.send.call(ws, data);
                },
                async sendClient(data) {
                    ws.listeners.message
                    .forEach(func =>
                        func.call(ws, {data})
                    );
                },
            });

        CWSS.sockets.push(ws);
        pipe('init').call(ws);

        ws.listeners = {};
        for (const key of ['open', 'message', 'close']) {
            const list = ws.listeners[key] = [];
            CWSS.addList.call(ws, key, pipe(key, list));
            rebase(ws, 'on'+key, list);
        }

        return ws;
    };





    for (const k in CWSS.ws)
        if (k != 'prototype')
            window.WebSocket[k] = CWSS.ws[k];

    for (const k in proto)
        if (k != 'constructor')
            try {
                window.WebSocket.prototype[k] = proto[k];
            } catch (e) {};





    native(proto.send, CWSS.send);
    native(proto.addEventListener, CWSS.addList);
    native(window.WebSocket, CWSS.ws);





    window.CWSS = CWSS;
    return CWSS;
})();
// 0vC4#7152

console.log('Launching...');
(() => {
    const Azti = window.Azti || {modules:{}};
    window.Azti = Azti;
    if ('Config' in Azti.modules) return;

    const module = {};
    module.zero = 0xCCCCCC;
    module.colors = new Uint32Array([0xFFFFFF,0xC4C4C4,0x888888,0x555555,0x222222,0x000000,0x006600,0x22B14C,0x02BE01,0x51E119,0x94E044,0xFBFF5B,0xE5D900,0xE6BE0C,0xE59500,0xA06A42,0x99530D,0x633C1F,0x6B0000,0x9F0000,0xE50000,0xFF3904,0xBB4F00,0xFF755F,0xFFC49F,0xFFDFCC,0xFFA7D1,0xCF6EE4,0xEC08EC,0x820080,0x5100FF,0x020763,0x0000EA,0x044BFF,0x6583CF,0x36BAFF,0x0083C7,0x00D3DD,0x45FFC8,0x003638,0x477050,0x98FB98,0xFF7000,0xCE2939,0xFF416A,0x7D26CD,0x330077,0x005BA1,0xB5E8EE,0x1B7400]);
    module.exclude = new Uint32Array([0x23123])
    module.packetSpeed = 40;
    module.packetCount = null;
    module.silent = true;
    module.tickSpeed = 300;
    module.timer = window;
    module.order = 'fromCenter';
    module.callbacks = [];
    module.subscribe = (...funcs) => {
        module.callbacks.push(...funcs.flat());
        funcs.flat().map(f => f(module));
    };

    Azti.config = new Proxy(module, {
        set(target, key, value) {
            target[key] = value;
            target.callbacks.map(c => c(target));
            return true;
        }
    });

    Azti.modules.Config = module;
})();
// 0vC4#7152

(() => {
    const Azti = window.Azti || {modules:{}};
    window.Azti = Azti;
    if ('MapLoader' in Azti.modules) return;

    const module = {};
    module.map = {};
    module.maps = {};

    module.args = {};
    module.config = ({colors}) => Object.assign(module.args, {colors});

    module.callbacks = [];
    module.subscribe = func => module.callbacks.push(func);

    const Img = window.Image;
    window.Image = function() {
        const img = new Img(...arguments);

        Object.defineProperty(img, 'src', {
            enumerable: true,
            configurable: true,
            set(val) {
                this.setAttribute('src', val);
                if (!val.match(/canvas\/\d+\.png\?/)) return;
                const serverId = +val.match(/canvas\/(\d+)\.png\?/)[1];

                this.addEventListener('load', () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(this, 0, 0);

                    const rgba = ctx.getImageData(0, 0, this.width, this.height).data;
                    const pixels = new Uint8Array(rgba.length>>2);
                    for (let i = 0; i < rgba.length; i += 4)
                        pixels[i>>2] = module.args.colors.indexOf((rgba[i]<<16) + (rgba[i+1]<<8) + (rgba[i+2]));

                    const {width, height} = this;
                    const map = {
                        pixels, width, height, serverId,
                        get(x,y) {
                            return this.pixels[x+y*this.width];
                        },
                        set(x,y,pixel) {
                            const offset = x+y*this.width;
                            if (this.pixels[offset] == null) return;
                            this.pixels[offset] = pixel;
                        }
                    };

                    if (!('serverId' in module.map)) Object.assign(module.map, map);
                    if (!Azti.map) Azti.map = map;

                    if (!Azti.maps) Azti.maps = {};
                    Azti.maps[serverId] = map;
                    module.maps[serverId] = map;

                    module.callbacks.map(f => f(module, map));
                });
            }
        });

        return img;
    };
    Object.assign(Image, Img);
    for (let k in Img.prototype) try {Image.prototype[k] = Img.prototype[k];} catch (e) {};

    Azti.modules.MapLoader = module;
})();
// 0vC4#7152

(() => {
    const Azti = window.Azti || {modules:{}};
    window.Azti = Azti;
    if ('ImageLoader' in Azti.modules) return;

    const progressManager = func => {
        const callbacks = {};
        const root = new Proxy({}, {
            get(target, key) {
                if (!target[key]) target[key] = callback => (callbacks[key] = callback, root);
                return target[key];
            }
        });
        root.start = (...args) => func(callbacks)(...args);
        return root;
    };

    const worker = progressManager(({progress=()=>0, finish=()=>0}) =>
    (data, func) => {
        const worker = new Worker(URL.createObjectURL(new Blob([`
            const progress = value => self.postMessage({progress:true,value});
            const finish = value => self.postMessage({finish:true,value});
            onmessage = async ({data}) => {
                await (${func.toString()})(data);
                close();
            };
        `], { type: "text/javascript" })));
        worker.addEventListener('message', ({data}) => data.progress && progress(data.value));
        worker.addEventListener('message', ({data}) => data.finish && finish(data.value));
        worker.postMessage(data);
    });

    const module = {};
    module.args = {};
    module.config = ({colors, exclude, zero}) =>
        Object.assign(module.args, {colors, exclude, zero});



    module.imageToPixels = progressManager(({progress=()=>0, finish=()=>0, silent=true}) =>
    (img,w,h) => {
        let {width, height} = img;
        if (w != null) width = w;
        if (h != null) height = h;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const rgba = ctx.getImageData(0, 0, width, height).data;

        worker.progress(progress).finish(finish).start(
        {rgba, width,height, silent, ...module.args},
        async ({rgba, width,height, silent, colors,exclude,zero}) => {
            const palette = [...colors.map(p => exclude.includes(p) ? zero : p)]
            .filter(p => p != zero)
            .map(clr => [(clr>>16)&0xFF, (clr>>8)&0xFF, clr&0xFF]);

            const toPixel = (r, g, b) => colors.indexOf(
                palette
                .map(([r2, g2, b2]) => ((r2-r)**2 + (g2-g)**2 + (b2-b)**2)*0x1000000 + (r2<<16) + (g2<<8) + b2)
                .sort((a,b) => a-b)[0] & 0xFFFFFF
            );

            const pixels = new Uint8Array(rgba.length>>2);
            for (let i = 0; i < rgba.length; i += 4) {
                silent || progress(i/rgba.length);
                pixels[i>>2] = rgba[i+3] >= 0xAA ? toPixel(rgba[i], rgba[i+1], rgba[i+2]) : -1;
            }

            finish([pixels, width, height]);
        });
    });



    module.loadImage = progressManager(({progress=()=>0, finish=()=>0, silent=true}) =>
    (w, h) => {
        const dropArea = document.createElement('div');
        top.document.body.appendChild(dropArea);
        dropArea.style = "width: calc(100% - 2em);height: calc(100% - 2em);position: fixed;left: 0px;top: 0px;background-color: rgba(0, 0, 0, 0.533);z-index: 9999;display: flex;color: white;font-size: 48pt;justify-content: center;align-items: center;border: 3px white dashed;border-radius: 18px;margin: 1em;";
        dropArea.textContent = "Drop Image";
        dropArea.onclick = e => dropArea.remove();

        ['dragenter','dragover','dragleave','drop'].forEach(eName =>
            dropArea.addEventListener(eName, e => {
                e.preventDefault();
                e.stopPropagation();
            }, false)
        );

        dropArea.addEventListener('drop', e => {
            const reader = new FileReader();
            reader.readAsDataURL(e.dataTransfer.files[0]);
            reader.onload = e => {
                const img = new Image;
                img.src = reader.result;
                img.onload = e => module.imageToPixels.silent(silent).progress(progress).finish(finish).start(img,w,h);
            };
            dropArea.remove();
        },false);
    });



    Azti.modules.ImageLoader = module;
})();
// 0vC4#7152

(() => {
    const Azti = window.Azti || {modules:{}};
    window.Azti = Azti;
    if ('Tools' in Azti.modules) return;

    const progressManager = func => {
        const callbacks = {};
        const root = new Proxy({}, {
            get(target, key) {
                if (!target[key]) target[key] = callback => (callbacks[key] = callback, root);
                return target[key];
            }
        });
        root.start = (...args) => func(callbacks)(...args);
        return root;
    };

    const worker = progressManager(({progress=()=>0, finish=()=>0}) =>
    (data, func) => {
        const worker = new Worker(URL.createObjectURL(new Blob([`
            const progress = value => self.postMessage({progress:true,value});
            const finish = value => self.postMessage({finish:true,value});
            onmessage = async ({data}) => {
                await (${func.toString()})(data);
                close();
            };
        `], { type: "text/javascript" })));
        worker.addEventListener('message', ({data}) => data.progress && progress(data.value));
        worker.addEventListener('message', ({data}) => data.finish && finish(data.value));
        worker.postMessage(data);
    });

    const module = {
        args: {},

        _wheelID: 0,
        get wheel() {
            const {exclude, colors} = module.args;
            let pixel = module._wheelID+1;
            while (exclude.includes(colors[pixel]))
                if (colors[++pixel] == null)
                    pixel = 0;
            module._wheelID = pixel;
            return pixel;
        },

        pixel: 0,
        size: 9,
        innerSize: 0,
        interval: 0,

        RGB2P(r, g, b) {
            const closest = module.args.rgb.map(([r2, g2, b2]) =>
                ((r2-r)**2 + (g2-g)**2 + (b2-b)**2)*0x1000000 + (r2<<16)+ (g2<<8) + b
            )
            .sort((a,b) => a-b)[0];

            return module.args.colors.indexOf(closest&0xFFFFFF);
        },
        CLR2P(color) {
            return module.RGB2P((color>>16)&0xFF, (color>>8)&0xFF, color&0xFF);
        },
    };

    module.config = ({colors,exclude,zero, timer,tickSpeed}) => {
        const palette = [...colors].map(color => exclude.includes(color) ? zero : color);
        const rgb = palette.filter(clr => clr != zero).map(clr => [((clr>>16)&0xFF), ((clr>>8)&0xFF), (clr&0xFF)]);
        Object.assign(module.args, {colors,exclude,zero, timer,tickSpeed, palette,rgb});
    };



    module.shader = progressManager(({
        progress=()=>0, finish=()=>0, tick=()=>0,
        silent=true,
        interval=module.interval
    }) => (map) => {
        const {timer} = module.args;
        let pos = 0;

        let t = timer.setInterval(() => {
            const {tickSpeed} = module.args;
            let i = 0;

            for (; pos < map.pixels.length; ) {
                silent || progress(pos/map.pixels.length, t);
                if (map.pixels[pos] === 255) {
                    pos++;
                    continue;
                }

                tick(pos%map.width, pos/map.width>>0, map.pixels[pos]);
                pos++;

                i++;
                if (i > tickSpeed) return;
                continue;
            }

            timer.clearInterval(t);
            finish(t);
        }, interval);

        return t;
    });



    module.square = progressManager(({
        progress=()=>0, finish=()=>0, tick=()=>0,
        silent=true,
        interval=module.interval,
        size=module.size,
        innerSize=module.innerSize,
    }) => (x,y,pixel=module.pixel) => {
        const {timer} = module.args;
        const half = size>>1;
        const innerHalf = innerSize>>1;
        let xi = -half;
        let yi = -half;

        let t = timer.setInterval(() => {
            const {tickSpeed} = module.args;
            let i = 0;

            for (; yi < half+1;) {
                for (; xi < half+1;) {
                    const pos = (xi+half+(yi+half)*size);
                    silent || progress(pos/size**2, t);

                    if (pixel === 255 || xi > -innerHalf && xi < innerHalf && yi > -innerHalf && yi < innerHalf) {
                        xi++;
                        continue;
                    }

                    tick(x+xi, y+yi, pixel);
                    xi++;

                    i++;
                    if (i > tickSpeed) return;
                    continue;
                }
                yi++;
                xi = -half;
            }

            timer.clearInterval(t);
            finish(t);
        }, interval);

        return t;
    });



    module.circle = progressManager(({
        progress=()=>0, finish=()=>0, tick=()=>0,
        silent=true,
        interval=module.interval,
        radius=module.size>>1,
        innerRadius=module.innerSize>>1,
    }) => (x,y,pixel=module.pixel) => {
        const {timer} = module.args;
        const half = radius;
        const innerHalf = innerRadius;
        let xi = -half;
        let yi = -half;

        let t = timer.setInterval(() => {
            const {tickSpeed} = module.args;
            let i = 0;

            for (; yi < half+1;) {
                for (; xi < half+1;) {
                    const pos = (xi+half+(yi+half)*size);
                    silent || progress(pos/size**2, t);

                    if (pixel === 255 || xi**2 + yi**2 > half**2 || xi**2 + yi**2 < innerHalf**2) {
                        xi++;
                        continue;
                    }

                    tick(x+xi, y+yi, pixel);
                    xi++;

                    i++;
                    if (i > tickSpeed) return;
                    continue;
                }
                yi++;
                xi = -half;
            }

            timer.clearInterval(t);
            finish(t);
        }, interval);

        return t;
    });



    module.image = progressManager(({
        progress=()=>0, finish=()=>0, tick=()=>0,
        interval=module.interval,
    }) => (pixels, x,y,w,h) => {
        const {timer} = module.args;
        let xi = 0;
        let yi = 0;

        let t = timer.setInterval(() => {
            const {tickSpeed} = module.args;
            let i = 0;

            for (; yi < h;) {
                for (; xi < w;) {
                    const pos = xi+yi*w;
                    progress(pos/pixels.length, t);

                    const pixel = pixels[pos];
                    if (pixel === 255) {
                        xi++;
                        continue;
                    }

                    tick(x+xi, y+yi, pixel);
                    xi++;

                    i++;
                    if (i > tickSpeed) return;
                    continue;
                }
                yi++;
                xi = 0;
            }

            timer.clearInterval(t);
            finish(t);
        }, interval);

        return t;
    });



    module.order = new Proxy({}, {
        get(_, type) {
            return progressManager(({
                progress=()=>0, finish=()=>0,
                silent=true,
                center=[0,0]
            }) => (queue) => {
                if (type == 'fromCenterQueue' || type == 'toCenterQueue') {
                    type = type.replace('Queue', '');
                    const [cxn, cyn] = queue.reduce(([x,y], [x2,y2]) => [x+x2,y+y2], [0, 0]);
                    center = [cxn/queue.length>>0, cyn/queue.length>>0];
                }
                worker.progress(progress).finish(finish)
                .start(
                    {queue, type, center, silent},
                    async ({queue, type, center, silent}) => {
                        const q = [...queue];
                        const size = queue.length*Math.log(queue.length)|0;
                        const [cx, cy] = center;
                        let i = 0;
                        const method = ({
                            start([x,y,p,i], [x2,y2,p2,i2]) {
                                silent || progress(i++/size);
                                return i-i2;
                            },
                            end([x,y,p,i], [x2,y2,p2,i2]) {
                                silent || progress(i++/size);
                                return i2-i;
                            },
                            rand() {
                                silent || progress(i++/size);
                                return Math.random()-.5;
                            },

                            top([x,y], [x2,y2]){
                                silent || progress(i++/size);
                                return y-y2;
                            },
                            left([x,y], [x2,y2]){
                                silent || progress(i++/size);
                                return x-x2;
                            },
                            right([x,y], [x2,y2]){
                                silent || progress(i++/size);
                                return x2-x;
                            },
                            bottom([x,y], [x2,y2]){
                                silent || progress(i++/size);
                                return y2-y;
                            },

                            fromCenter([x,y], [x2,y2]) {
                                silent || progress(i++/size);
                                return ((x-cx)**2+(y-cy)**2) - ((x2-cx)**2+(y2-cy)**2);
                            },
                            toCenter([x,y], [x2,y2]) {
                                silent || progress(i++/size);
                                return ((x2-cx)**2+(y2-cy)**2) - ((x-cx)**2+(y-cy)**2);
                            },

                            fromVertical([x,y], [x2,y2]) {
                                silent || progress(i++/size);
                                return Math.abs(x-cx) - Math.abs(x2-cx);
                            },
                            toVertical([x,y], [x2,y2]) {
                                silent || progress(i++/size);
                                return Math.abs(x2-cx) - Math.abs(x-cx);
                            },

                            fromHorizontal([x,y], [x2,y2]) {
                                silent || progress(i++/size);
                                return Math.abs(y-cy) - Math.abs(y2-cy);
                            },
                            toHorizontal([x,y], [x2,y2]) {
                                silent || progress(i++/size);
                                return Math.abs(y2-cy) - Math.abs(y-cy);
                            },
                        });

                        q.sort(method[type] || method['start']);
                        silent || progress(1);
                        finish(q);
                    }
                );
            });
        }
    });



    Azti.modules.Tools = module;
})();
// 0vC4#7152

(() => {
    const Azti = window.Azti || {modules:{}};
    window.Azti = Azti;
    if ('Compiler' in Azti.modules) return;



    const module = {};
    module.args = {};
    module.intervals = [];
    module.main = null;
    module.config = ({timer, packetSpeed, packetCount}) => {
        if (module.main) {
            module.args.timer.clearInterval(module.main[0]);
            module.main = [
                timer.setInterval(module.main[1]),
                module.main[1]
            ];
        }

        if (module.intervals.length) {
            module.intervals = module.intervals.map(([id, func, ws]) => {
                module.args.timer.clearInterval(id);
                ws._inter = timer.setInterval(func, packetCount > 0 ? 0 : 1e3/packetSpeed);
                return [ws._inter, func, ws];
            });
        }

        Object.assign(module.args, {timer, packetSpeed, packetCount});
    };



    module.compile = () => {
        const {timer, packetCount, packetSpeed} = module.args;

        Object.assign(Azti, {
            ws: null,
            map: {},
            onclick: null,

            queueId: 0,
            queue: [],
            pos: 0,
            lock: false,
            last: [0,0,255],
            set(x, y, p) {
                Azti.queue.push([x, y, p, Azti.queueId++]);
            },

            _id: 0,
            _posSocket: 0,
            sockets: [],
            getSocket() {
                let i = 0;
                let ws = null;

                while (i++ < Azti.sockets.length) {
                    const _ws = Azti.sockets[Azti._posSocket++];
                    if (Azti._posSocket > Azti.sockets.length-1) Azti._posSocket = 0;
                    if (!_ws) continue;
                    if (_ws.ignore) continue;

                    if (Azti.config.packetCount > 0) {
                        if (_ws.count > 0) _ws.count--;
                        else continue;
                    } else if (!_ws.can || !_ws.ready) continue;

                    ws = _ws;
                    break;
                }

                return ws;
            }
        });



        let progress = false;
        const mainFunc = () => {
            if (progress) return;
            progress = true;

            while (Azti.pos < Azti.queue.length) {
                const [x, y, p, i] = Azti.queue[Azti.pos++];
                if (p === 255 || Azti.map.get(x,y) === 255) {
                    Azti.queue.splice(--Azti.pos, 1);
                    continue;
                }
                if (Azti.map.get(x,y) === p) continue;

                const ws = Azti.getSocket();
                if (!ws) {
                    Azti.pos--;
                    progress = false;
                    return;
                }

                ws.can = false;
                Azti.CWSS.send.call(ws, `42["p",[${x},${y},${p},${1+Azti.pos}]]`);
                continue;
            }

            if (Azti.lock && Azti.pos > Azti.queue.length-1) {
                Azti.pos = 0;
                progress = false;
                return;
            }

            Azti.pos = 0;
            Azti.queue = [];
            Azti.queueId = 0;
            progress = false;
        };
        module.main = [timer.setInterval(mainFunc), mainFunc];



        Azti.modules.MapLoader.subscribe((module, map) => {
            Object.assign(Azti.map, map);
            Azti.map.pixels = new Uint8Array(map.pixels);
            Azti.serverId = map.serverId;
        });



        module.hook = {
            priority: 0,

            open() {
                if (!this.username) {
                    Azti.ws = this;
                    this.addEventListener('close', e=>{
                        Azti.ws = null;
                    });
                }

                Azti.sockets.push(this);
                this.id = Azti._id++;
                const func = () => this.can = true;

                this.addEventListener('close', () => {
                    const el = module.intervals.find(([id, f, ws]) => f == func);
                    module.intervals.splice(module.intervals.indexOf(el), 1);
                    module.args.timer.clearInterval(this._inter);
                    Azti.sockets.splice(Azti.sockets.indexOf(this),1);
                });

                this.can = true;
                this._inter = module.args.timer.setInterval(func, packetCount > 0 ? 0 : 1e3/packetSpeed);
                module.intervals.push([this._inter, func, this]);

                return arguments;
            },

            message({data}) {
                if (Azti.ws != this) return arguments;

                const message = JSON.parse(data.split(/(?<=^\d+)(?=[^\d])/)[1] || '[]');
                if (!message.length) return arguments;

                const [event, json] = message;
                if (event == 'canvas') {
                    json.map(p => Azti.map.set(...p));
                    Azti.ws.ready = true;
                }
                if (event == 'p') {
                    json.map(p => Azti.map.set(...p));
                    this.count = Azti.config.packetCount;
                }

                return arguments;
            },

            send(data) {
                if (Azti.ws != this) return arguments;

                const message = JSON.parse(data.split(/(?<=^\d+)(?=[^\d])/)[1] || '[]');
                if (!message.length) return arguments;

                const [event, json] = message;
                if (event == 'p') {
                    const [x, y, pixel] = json;
                    Azti.last = [x, y, pixel];
                    if (Azti.onclick && Azti.onclick(x, y, pixel) === false) return;
                }

                return arguments;
            }
        };
        Azti.CWSS.setHook(module.hook);
    };



    Azti.modules.Compiler = module;
})();
// 0vC4#7152

(() => {
    const Azti = window.Azti || {modules:{}};
    window.Azti = Azti;
    if ('Connect' in Azti.modules) return;



    const pongAlive = () => {
        const {random} = Math;
        const word = 'gmbozcfxta';

        function hash(size) {
            const arr = [];
            const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (var i = 0; i < size; i++) arr.push(str[random()*str.length | 0]);
            return arr.join('');
        }

        function hash2(size) {
            const arr = [];
            const str = "gmbonjklezcfxtaGMBONJKLEZCFXTA";
            for (var i = 0; i < size; i++) arr.push(str[random()*str.length | 0]);
            return arr.join('');
        }

        let result = '';
        const seed = (((new Date().getTime()/1e3|0) + 1678) + '').split('');
        const arr = [hash(5),hash(7),hash2(3),hash(8),hash2(6),hash(3),hash(6),hash2(4),hash(7),hash(6)];
        for (const i in seed) {
            result += arr[i];
            result += !(random()*2|0) ? word[+seed[i]].toUpperCase() : word[+seed[i]];
        }
        result += '0=';

        return `42["pong.alive","${result}"]`;
    };



    const module = {
        bots: [],
        settings: new Proxy(JSON.parse(localStorage.getItem('settings')||'{}'), {
            get(target, key) {
                return target[key];
            },
            set(target, key, value) {
                target[key] = value;
                localStorage.setItem('settings', JSON.stringify(target));
                return true;
            },
            remove(target, key) {
                delete target[key];
                localStorage.setItem('settings', JSON.stringify(target));
                return true;
            }
        })
    };
    module.args = {};
    module.config = ({timer}) => Object.assign(module.args, {timer});



    const {settings} = module;
    Object.assign(module, {
        async show() {
            return JSON.stringify([
                (await cookieStore.get('authId')).value,
                (await cookieStore.get('authToken')).value,
                (await cookieStore.get('authKey')).value
            ]);
        },
        async add(username, scheme) {
            settings.userlist[username] = typeof scheme == 'string' ? JSON.parse(scheme) : scheme;
            return true;
        },
        async remove(username) {
            delete settings.userlist[username];
            return true;
        },



        async save() {
            settings.current = {
                authId: (await cookieStore.get('authId')).value,
                authToken: (await cookieStore.get('authToken')).value,
                authKey: (await cookieStore.get('authKey')).value
            };
        },
        async load(scheme = null) {
            await cookieStore.set('authId', scheme ? scheme[0] : settings.current.authId);
            await cookieStore.set('authToken', scheme ? scheme[1] : settings.current.authToken);
            await cookieStore.set('authKey', scheme ? scheme[2] : settings.current.authKey);
        },



        async join(username, server) {
            if (!settings.userlist[username]) return null;
            const [id, token, key] = settings.userlist[username];

            await module.save();
            await cookieStore.set('authId', id);
            await cookieStore.set('authToken', token);
            await cookieStore.set('authKey', key);

            await fetch(`https://pixelplace.io/api/get-painting.php?id=${server}&connected=1`);
            if (!(await cookieStore.get('authToken'))) {
                console.log(
                    username,
                    "is banned or it has wrong data, please remove this account using Azti.remove('",
                    username,
                    "');"
                );
                await module.load();
                return null;
            }

            settings.userlist[username] = [
                (await cookieStore.get('authId')).value,
                (await cookieStore.get('authToken')).value,
                (await cookieStore.get('authKey')).value
            ];
            await module.load();

            return settings.userlist[username];
        },

        async connect(username, boardId) {
            const result = await module.join(username, boardId);
            if (!result) return null;
            if (module.bots.find(ws => ws.username == username)) return null;
            const [authId, authToken, authKey] = result;

            const restart = () => {
                const {timer} = module.args;
                const user = new WebSocket('wss://pixelplace.io/socket.io/?EIO=3&transport=websocket');
                user.username = username;
                user.serverId = boardId;
                user.onmessage = ({data}) => {
                    const [code, msg] = data.split(/(?<=^\d+)(?=[^\d])/);
                    if (code == '40') user.send('42' + JSON.stringify(
                        ["init", { authKey, authToken, authId, boardId }]
                    ));

                    const message = JSON.parse(msg || '[]');
                    if (message.pingInterval) user.ping = timer.setInterval(() => user.send('2'), message.pingInterval);

                    if (!message.length) return arguments;
                    const [event, json] = message;
                    if (event == 'throw.error' && ![3].includes(json)) {
                        user.kick = true;
                        user.close();
                    }
                    if (event == 'canvas.alert' && json.includes('Your account')) {
                        console.log('Banned, reason: ', json);
                        user.kick = true;
                        user.close();
                    }
                    if (event == 'ping.alive') user.send(pongAlive());
                    if (event == 'canvas') {
                        user.ready = true;
                        console.log(username, 'bot connected');
                    }
                    if (event == 'p') user.count = Azti.config.packetCount;
                };
                user.onclose = async () => {
                    timer.clearInterval(user.ping);
                    module.bots.splice(module.bots.indexOf(user), 1);
                    if (!user.kick) {
                        console.log(username, 'bot restarting');
                        restart();
                    } else {
                        console.log(username, 'bot disconnected');
                    }
                };
                user.set = (x,y,p) => user.send(`42["p",[${x},${y},${p},1]]`);
                module.bots.push(user);

                return user;
            };
            return restart();
        },

        async connectAll(serverId) {
            const names = Object.keys(settings.userlist);
            const arr = [];

            let n = 0;
            for (let i = 0; i < names.length; i++) {
                let ws = null;

                try {
                    ws = await module.connect(names[i], serverId);
                } catch (e) {
                    ws = null;
                }

                if (!ws) {
                    n++;
                    continue;
                }

                arr[i-n] = ws;
                ws.addEventListener('close', e => arr.splice(arr.indexOf(ws), 1));
            }

            console.log(names.length-n, 'bots connected');
            return arr;
        },



        async disconnect(...usernames){
            usernames = usernames.flat();
            module.bots.filter(Boolean).map(ws => {
                if (!ws || !ws.close) return;
                ws.ignore = true;
                ws.kick = true;
                if (!usernames.length) return ws.close();
                if (usernames.includes(ws.username)) return ws.close();
            });
        }
    });



    if (!settings.userlist) settings.userlist = {};



    Azti.connect = async (username) => await module.connect(username, Azti.serverId);
    Azti.connectAll = async () => await module.connectAll(Azti.serverId);
    Azti.disconnect = module.disconnect;
    Azti.link = async (username) => await module.add(username, JSON.parse(await module.show()));
    Azti.show = module.show;
    Azti.add = module.add;
    Azti.remove = module.remove;
    Object.defineProperty(Azti, 'userlist', {enumerable:true,configurable:true,get(){
        return settings.userlist;
    }});

    Azti.modules.Connect = module;
})();
// 0vC4#7152

Object.defineProperty(window.console, 'log', {configurable:false,enumerable:true,writable:false,value:console.log});
Object.defineProperty(window, 'setInterval', {configurable:false,enumerable:true,writable:false,value:WorkerTimer.setInterval});
Object.defineProperty(window, 'clearInterval', {configurable:false,enumerable:true,writable:false,value:WorkerTimer.clearInterval});
Object.defineProperty(window, 'setTimeout', {configurable:false,enumerable:true,writable:false,value:WorkerTimer.setTimeout});
Object.defineProperty(window, 'clearTimeout', {configurable:false,enumerable:true,writable:false,value:WorkerTimer.clearTimeout});
setInterval(() => {
    const _18 = document.querySelector('[data-id="alert"]');
    if (!_18 || _18.style.display != 'flex') return;
    document.querySelector('.nsfw-continue').click();
});
(() => {
    const Azti = window.Azti || {modules:{}};
    window.Azti = Azti;
    Azti.CWSS = CWSS;

    const {ImageLoader, Tools} = Azti.modules;
    const config = Azti.config;

    config.timer = WorkerTimer;
    config.packetSpeed = 50;
    config.subscribe(...Object.values(Azti.modules).map(({config}) => config).filter(Boolean));
    Azti.modules.Compiler.compile();

    Object.defineProperty(Azti, 'ignore', {enumerable:true,configurable:true,get(){
        let b = !Azti.ws.ignore;
        Azti.sockets.map(ws=>ws.ignore = b);
        return b;
    },set(v){
        Azti.sockets.map(ws=>ws.ignore = v);
        return v;
    }});

    Azti.order = new Proxy({}, {
        get(_, type) {
            Azti.config.order = type;
            return Tools.order[type]
            .finish(queue => {
                Azti.pos = 0;
                Azti.queue = queue;
                console.log('Finished Queue');
            })
            .center([Azti.map.width/2, Azti.map.height/2])
            .silent(Azti.config.silent)
            .start(Azti.queue);
        }
    });

    Azti.mode = mode => {
        if (mode == 'none') {
            Azti.onclick = () => true;
            return true;
        }

        if (mode == 'rainbow_hole_v2') {
            Azti.onclick = (x,y,pixel) => {
                const {width, height} = Azti.map;
                const {palette, zero} = Tools.args;

                let clr = 0;
                let perc = null;

                Tools.shader
                .tick((x,y,p) => {
                    const dx = (x/4-width/8)**2;
                    const dy = (y-height/2)**2;
                    const dist = (dx+dy)**.75;

                    const percent = 1000*dist/(height/2)>>0;
                    if (percent != perc) {
                        perc = percent;
                        clr = perc%palette.length;
                        while (palette[clr] == zero) {
                            clr++;
                            if (clr > palette.length-1) clr = 0;
                        }
                    }

                    Azti.set(x, y, clr);
                })
                .finish((taskId) => {
                    console.log('Finished Shader');
                    Tools.order[config.order]
                    .finish(queue => {
                        Azti.pos = 0;
                        Azti.queue = queue;
                        console.log('Finished Queue');
                    })
                    .silent(Azti.config.silent)
                    .center([width/2, height/2])
                    .start(Azti.queue);
                })
                .start(Azti.map);

                return false;
            };
            return true;
        }

        if (mode == 'rainbow_hole') {
            Azti.onclick = (x,y,pixel) => {
                const {width, height} = Azti.map;
                const {palette, zero} = Tools.args;

                let clr = 0;
                let perc = null;

                Tools.shader
                .tick((x,y,p) => {
                    const dist = ((x-width/2)**2+(y-height/2)**2)**0.5;
                    const percent = 1000*dist/(height/2)>>0;
                    if (percent != perc) {
                        perc = percent;
                        clr = perc%palette.length;
                        while (palette[clr] == zero) {
                            clr++;
                            if (clr > palette.length-1) clr = 0;
                        }
                    }
                    Azti.set(x, y, clr);
                })
                .finish((taskId) => {
                    console.log('shader finished');
                    Tools.order[config.order]
                    .finish(queue => {
                        Azti.pos = 0;
                        Azti.queue = queue;
                        console.log('order finished');
                    })
                    .silent(Azti.config.silent)
                    .center([width/2, height/2])
                    .start(Azti.queue);
                })
                .start(Azti.map);

                return false;
            };
            return true;
        }

        if (mode == 'border_rainbow') {
            Azti.onclick = (x,y,pixel) => {
                const areaSize = 5;
                const has = areaSize>>1;
                const padding = 2;
                const {width, height, pixels} = Azti.map;

                Tools.shader
                .tick((x,y,p) => {
                    if (x < areaSize || x > width-1-areaSize || y < areaSize || y > height-1-areaSize) return;

                    let start = (x-has)+(y-has)*width;
                    let area = [];
                    for (let i = 0; i < areaSize; i++) {
                        const offset = start+i*width;
                        area.push(...pixels.slice(offset, offset+areaSize));
                    }

                    if (area.find(p => p === 255)) {
                        Azti.set(x, y, Tools.wheel);
                        return;
                    }



                    const size = areaSize+padding*2;
                    const hs = has+padding;

                    if (x < size || x > width-1-size || y < size || y > height-1-size) return;

                    start = (x-hs)+(y-hs)*width;
                    area = [];
                    for (let i = 0; i < size; i++) {
                        const offset = start+i*width;
                        area.push(...pixels.slice(offset, offset+size));
                    }

                    if (area.find(p => p === 255)) {
                        Azti.set(x, y, 5);
                        return;
                    }

                    Azti.set(x, y, 5);
                })
                .finish((taskId) => {
                    console.log('shader finished');
                    Tools.order[config.order]
                    .finish(queue => {
                        Azti.pos = 0;
                        Azti.queue = queue;
                        console.log('order finished');
                    })
                    .silent(Azti.config.silent)
                    .center([width/2, height/2])
                    .start(Azti.queue);
                })
                .start(Azti.map);

                return false;
            };
            return true;
        }

        if (mode == 'image') {
            Azti.onclick = (x,y,pixel) => {
                ImageLoader.loadImage
                .finish(([pixels, w, h]) => {
                    if (config.order == 'fromCenter') x -= w/2>>0;
                    if (config.order == 'fromCenter') y -= h/2>>0;

                    Tools.image
                    .tick((x,y,p) => {
                        if (!(x>=0&&y>=0&&x<Azti.map.width&&y<Azti.map.height)) return;
                        Azti.set(x, y, p);
                    })
                    .finish((taskId) => {
                        console.log('Finished Image');
                        Tools.order[config.order]
                        .finish(queue => {
                            Azti.pos = 0;
                            Azti.queue = queue;
                            console.log('Fnished Queue');
                        })
                        .silent(Azti.config.silent)
                        .center([x+w/2, y+h/2])
                        .start(Azti.queue);
                    })
                    .start(pixels, x,y,w,h);
                }).start();

                return false;
            };
            return true;
        }
    };

    Azti.lock = true;
    Azti.mode('image');
    Azti.order["left"]


// Does this remember you to something?? :]
const Menu = {
    title: $('<h1 id="drag">').text('𝙋𝙋𝘾𝙡𝙞𝙚𝙣𝙩++'),
    preview: $('<div id="Bkg">'),
    width: $('<input type="number" placeholder="Width">'),
    height: $('<input type="number" placeholder="Height">'),
    select: $('<select id="select">'),
    original: $('<p>'),
    restart: $('<button>').text('Restart Botting'),
    stop: $('<button>').text('Cancel Botting'),
    togglebot: $('<button id=tglbot>').text('Toggle Bot [ON]')
}

$([Menu.preview[0]]).css({
    "border": "2px rgb(8,8,8) solid",
    "background": "linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(34,34,34,1) 100%)",
    "border-radius": "0px",
    "color": "#d9d2d2",
    "padding": "5px",
    "opacity": '1',
    "margin": "5px"
})

$([Menu.togglebot[0], Menu.restart[0], Menu.title[0], Menu.stop[0], Menu.select[0],]).css({
    "border": "2px rgb(8,8,8) solid",
    "background": "linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(34,34,34,1) 100%)",
    "border-radius": "0px",
    "color": "#d9d2d2",
    "padding": "5px",
    "font-family": "monospace",
    "user-select": "none",
    "opacity": '1',
    "margin": "5px"
})
let uiMenu = $('<div id=realdrag>')

//Like my code?? LOL
    Menu.preview.append($(Menu.original),
    $('<div>').append(Menu.title),
    Menu.select.append($('<option>', {
                    value: 1,
                    text: 'Left'
                })),
    Menu.select.append($('<option>', {
                    value: 2,
                    text: 'Start'
                })),
    Menu.select.append($('<option>', {
                    value: 3,
                    text: 'End'
                })),
    Menu.select.append($('<option>', {
                    value: 4,
                    text: 'Random'
                })),
    Menu.select.append($('<option>', {
                    value: 5,
                    text: 'Top'
                })),
    Menu.select.append($('<option>', {
                    value: 6,
                    text: 'Right'
                })),
    Menu.select.append($('<option>', {
                    value: 7,
                    text: 'Bottom'
                })),
    Menu.select.append($('<option>', {
                    value: 8,
                    text: 'FromCenter'
                })),
    Menu.select.append($('<option>', {
                    value: 9,
                    text: 'ToCenter'
                })),
    Menu.select.append($('<option>', {
                    value: 10,
                    text: 'FromVertical'
                })),
    Menu.select.append($('<option>', {
                    value: 11,
                    text: 'ToVertical'
                })),
    Menu.select.append($('<option>', {
                    value: 12,
                    text: 'FromHorizontal'
                })),
    Menu.select.append($('<option>', {
                    value: 13,
                    text: 'ToHorizontal'
                })),
    Menu.original,
    $('<div>').append(Menu.togglebot),
    $('<div>').append(Menu.restart, Menu.stop))
    uiMenu.append(Menu.preview)

uiMenu.css({
    'display': 'none',
    'position': 'absolute',
    'font-family': 'Monospace',
    'color': '#d9d2d2',
    'background': 'rgb(27,27,27)',
    'border': '2px rgb(0,178,225) solid',
    'top': '23%',
    'left': '1%',
    'padding': '0px'
})

$(document.body).append(uiMenu)
$('#container').append(Azti)
let buttons = $('#menu-buttons')
let elem = $('<a href="#" title="Bot Menu" class="grey margin-top-button"><img src="https://i.imgur.com/tLWE5SR.png" alt="icon"></a>')
elem.on('click', function () {
    $(uiMenu).toggle("slide", { direction: "left" }, 400);
    $(this).animate({ deg: 360 }, {
        duration: 800,
        step: function(now) {
            $(this).css({ transform: 'rotate(' + now + 'deg)' });
        }
    });
});
$('#select').change(function() {
    if ($(this).val() === '1') {
         Azti.order["left"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '2') {
         Azti.order["start"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '3') {
    Azti.order["end"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '4') {
    Azti.order["rand"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '5') {
    Azti.order["top"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '6') {
    Azti.order["right"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '7') {
    Azti.order["bottom"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '8') {
    Azti.order["fromCenter"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '9') {
    Azti.order["toCenter"]
    }
});

$('#select').change(function() {
    if ($(this).val() === '10') {
    Azti.order["fromVertical"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '11') {
    Azti.order["toVertical"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '12') {
    Azti.order["fromHorizontal"]
    }
});
$('#select').change(function() {
    if ($(this).val() === '13') {
    Azti.order["toHorizontal"]
    }
});

Menu.stop.on('click', function () {
    Menu.state = true
      toastr.info('Stopped Botting')
      Azti.queue = [];
})
Menu.restart.on('click', function () {
    Menu.state = true
      toastr.info('Restarted Queue')
      Azti.pos = 0
})




// KEYBINDS N' TOGGLE BUTTONS
// KEYBINDS N' TOGGLE BUTTONS
// KEYBINDS N' TOGGLE BUTTONS
// KEYBINDS N' TOGGLE BUTTONS
let toggle = function() {
    var on = false;
    return function() {
    if(!on) {
        on = true;
      toastr.info('Paused Botting')
      Azti.mode("none")
      document.getElementById('tglbot').innerHTML = 'Toggle Bot [OFF]';
      Azti.ignore = true
        return;
    }
    toastr.info('Resumed Botting')
    Azti.mode('image')
    document.getElementById('tglbot').innerHTML = 'Toggle Bot [ON]';
    Azti.ignore = false
    on = false;
}
}();
//togglebot
Menu.togglebot.on('click', function () {
    Menu.state = true
    toggle();
})
document.addEventListener('keydown',function(e) {
   var key = e.keyCode || e.which;
   if(e.altKey && key === 81) {
      toggle();
   }
}, false);

document.addEventListener('keydown',function(e) {
   var key = e.keyCode || e.which;
   if(e.altKey && key === 82) {
      toastr.info('Restarted Queue')
      Azti.pos = 0
   }
});

document.addEventListener('keydown',function(e) {
   var key = e.keyCode || e.which;
   if(e.altKey && key === 87) {
      toastr.info('Stopped Botting')
      Azti.queue = [];
   }
});

})();
document.getElementById('copyright').innerHTML = 'PPClient++ Public 1.0.1';
// 0vC4#7152 aka Palette