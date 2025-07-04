const options = {
  devMode: true,
  moduleCache: {
    vue: Vue,
  },
  async getFile(url) {
    const res = await fetch(url);
    if (!res.ok)
      throw Object.assign(new Error(res.statusText + ' ' + url), { res });
    console.log(res)
    return {
      getContentData: (asBinary) => {
        return asBinary ? res.arrayBuffer() : res.text()
      }
    }
  },
  addStyle(textContent) {
    const style = Object.assign(document.createElement('style'), { textContent });
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
  handleModule: async (type, getContentData, path, options) => {
    switch (type) {
      case '.svg': return 'data:image/svg+xml,' + await getContentData(false);
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
      'AppScreen': Vue.defineAsyncComponent(() => loadModule('./App.vue', options))
    }
  }).mount('#app')
}

window.launchpad.init()