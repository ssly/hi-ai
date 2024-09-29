const inUtools = typeof window.services === 'object'

const datebase = {
  get(key) {
    if (inUtools) {
      return window.services.db.get(key)
    }
    return localStorage.getItem(key)
  },
  put(src) {
    if (inUtools) {
      return window.services.db.put(src)
    }
    const { _id, data } = src
    localStorage.setItem(_id, JSON.stringify(data))
  },
  remove(key) {
    if (inUtools) {
      return window.services.db.remove(key)
    }
    localStorage.removeItem(key)
  },
}

function handleOpenUrl(url) {
  if (inUtools) {
    window.services.shellOpenExternal(url)
  } else {
    window.open(url, '_blank')
  }
}

export { datebase, handleOpenUrl }
