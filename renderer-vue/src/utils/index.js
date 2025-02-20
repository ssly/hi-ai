const inUtools = typeof window.services === 'object'

const supportStreamModels = ['gpt-4o-mini', 'gpt-4o']
const supportStream = model => supportStreamModels.includes(model)

const datebase = {
  get(key) {
    if (inUtools) {
      return window.services.db.get(key)
    }

    try {
      const obj = localStorage.getItem(key)
      return JSON.parse(obj)
    } catch (e) {
      console.error('localStorage.getItem error', e)
      return null
    }
  },
  put(src) {
    if (inUtools) {
      return window.services.db.put(src)
    }
    const { _id, _rev, ...data } = src
    localStorage.setItem(_id, JSON.stringify(data))
    return Promise.resolve({ _rev })
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

function queryAnswer(messages, options = {}) {
  console.log('queryAnswer:options is', messages, options)
  if (inUtools) {
    return window.services.askByOpenAI(messages, {
      model: options.model,
      apiKey: options.apiKey,
      stream: supportStream(options.model),
    })
  } else {
    // TODO 先写死
    return Promise.resolve({
      choices: [
        {
          message: { content: 'hello' },
        },
      ],
    })
  }
}

export { datebase, handleOpenUrl, queryAnswer }
