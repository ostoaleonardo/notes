global.requestIdleCallback = (callback) => setTimeout(callback, 0)
global.cancelIdleCallback = (handle) => clearTimeout(handle)
