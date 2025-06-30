const options = {
  devMode: true,
  moduleCache: {
    vue: Vue,
  },
  async getFile(url) {
    console.log('get file', url)
    const res = await fetch(url);
    console.log('get file - res', res)
    if ( !res.ok )
      throw Object.assign(new Error(res.statusText + ' ' + url), { res });
    return {
      getContentData: (asBinary) => {
        console.log('as binary?', asBinary, res)
        return asBinary ? res.arrayBuffer() : res.text()
      }
    }
  },
  addStyle(textContent) {
    const style = Object.assign(document.createElement('style'), { textContent });
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
  handleModule: async function (type, getContentData, path, options) {
    switch (type) { 
      case '.svg':
        return getContentData(false); // load as binary
      case '.mp3':
        return getContentData(true); // load as binary
    } 
  },
  log(type, ...args) {
    console[type](...args);
  }
}
const { loadModule } = window['vue3-sfc-loader']

window.launchpad = {}
window.launchpad.init = () => {
  const { createApp, ref } = Vue
  createApp({
    components: {
      'AppScreen': Vue.defineAsyncComponent( () => loadModule('./App.vue', options) )
    }
  }).mount('#app')  
}

window.launchpad.init()