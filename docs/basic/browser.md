测试浏览器相关的 api 需要配置 vitest 为 `jsdom` 的环境，我们项目已经配置好了，如果不配置或者是 `node.js` 环境，是不能调用浏览器平台级的 api 

```ts
// vitest.config.ts
  defineConfig({
    test: {
      environment: 'jsdom'
    }
  })
```
## 测试 LocalStorage
下面是我写的一个`localStorage`的工具方法 `getItems` 和 `setItem`。
```ts
export const KEY = 'test-app'

export const getItems = () => JSON.parse(localStorage.getItem(KEY) ?? '[]')

export const addItem = (todo: Record<string, any>) => {
  const items = getItems()

  items.push(todo)

  localStorage.setItem(KEY, JSON.stringify(todo))
}

```

### 真实调用 LocalStorage Api
测试方法也非常简单，直接使用 `localStorage.setItem` 设置一个值，然后调用方法的 `getItems`,因为 localStorage 会影响每一个单独的用例，保持数据干净，所以需要使用 `localStorage.clear()`
    
```ts
describe('localStorage 测试', () => {
  afterEach(() => {
    localStorage.clear()
  })
  it('测试 getItem', () => {
    const todo = {
      id: 11111,
      text: '测试一下'
    }
    localStorage.setItem(KEY, JSON.stringify([todo]))
    expect(getItems()).toStrictEqual([todo])
  })
  it('测试 setItem', () => {
    const todo = {
      id: 11111,
      text: '测试一下'
    }
    addItem(todo)
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    expect(value).toStrictEqual(todo)
  })
})
```

### mock 方式
但实际业务中我们很少会去测试 localStorage 是否真的被设置成功，往往都是通过 mock 的方式去使用, 只验证调用的参数否是正确,如下示例，需要使用 spy `const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')`，之后再调用 `getItems()` 之后，通过断言 `getItemSpy` 调用时候的参数是否正确即可

```ts
describe('mock localStorage 测试', () => {
  const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
  afterAll(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('测试 getItem', () => {
    const todo = {
      id: 11111,
      text: '测试一下'
    }
    localStorage.setItem(KEY, JSON.stringify([todo]))

    expect(getItems()).toStrictEqual([todo])
    expect(getItemSpy).toHaveBeenCalledWith(KEY)
  })
  it('测试 setItem', () => {
    const todo = {
      id: 11111,
      text: '测试一下'
    }
    addItem(todo)

    expect(setItemSpy).toHaveBeenCalledWith(KEY, JSON.stringify(todo))
    expect(getItems()).toStrictEqual(todo)
  })
})
```
## 测试 Window Location
测试浏览器跳转的事件，比如 reload、replace 等，即使配置了 `jsdom`的环境，也很难模拟浏览器真实跳转的行为。因为我们在真实浏览器环境下，是肉眼去看浏览器是否刷新，所以我们最好使用 mock 的方式去测试，我们先来看看两个函数
```ts
export function reloadWindow() {
  window.location.reload()
}

export function changeWindowLocation() {
  window.location.href = 'https://www.juejin.com'
}

```
再根据上面 `mock localStorage` 的方式直接使用 `spy`
```ts
  const reloadSpy = vi.spyOn(window.location, 'reload')
  afterEach(() => {
    reloadSpy.mockClear()
  })
  it('reloads the window', () => {
    reloadWindow()
    expect(reloadSpy).toHaveBeenCalled()
  })
```
会发现，控制台是会报错的, `vi.spy` 不能代理 reload

![image.png](/10.1.jpg)

那我们只能采取 `vi.fn` 去覆盖掉原来的 `reload` 方法，然后保留其他的属性，例如真实的 `location`
```ts
describe('location 测试', () => {
  const originLocation = window.location
  const mockReLoad = vi.fn()
  beforeEach(() => {
    const url = originLocation.href
    window.location = {
      href: url,
      reload: mockReLoad
    } as any
  })
  afterEach(() => {
    window.location = originLocation
  })
  it('测试 reload 被调用', () => {
    reloadWindow()
    expect(mockReLoad).toHaveBeenCalledTimes(1)
  })
  it('测试重定向 href', () => {
    changeWindowLocation()
    expect(window.location.href).toBe('https://www.juejin.com')
  })
  it('测试默认路径不受前面用例影响', () => {
    expect(window.location.href).not.toBe('https://www.juejin.com')
  })
})
```
1. 先创建了一个模拟的`window.location.reload`函数，保留浏览器其他相关真实的 api
2. 然后调用了`changeWindowLocation`方法，它会执行 `reload` 
3. 断言`mockReload`是否被调用。断言当前地址是`'https://www.juejin.com'`。


## 测试事件监听 window.addEventListener

还是按照上面的办法，先 mock `window.addEventListener`，然后判断是否被调用

```ts
export function handleEvent(event: string, callback: Function, bubble = false) {
  window.addEventListener(
    event,
    () => {
      console.log('111')
      callback()
    },
    bubble
  )
}

```


```ts
describe('测试事件', () => {
  it('能否监听和触发执行', () => {
    // 创建一个模拟回调函数
    const mockCallback = vi.fn()
    // 模拟 window.addEventListener
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    // 调用 handleEvent 并传入参数
    handleEvent('click', mockCallback, true)

    // 触发 click 事件以测试 handleEvent 是否能正确工作
    const clickEvent = new Event('click', { bubbles: true })
    document.body.dispatchEvent(clickEvent)

    // 断言 window.addEventListener 是否被正确调用
    expect(addEventListenerSpy).toBeCalledWith('click', expect.any(Function), true)

    // 断言回调函数是否被调用
    expect(mockCallback).toHaveBeenCalledTimes(1)

    // 清理
    addEventListenerSpy.mockRestore()
  })
})

```

1. 先创建了一个模拟的`mockCallback`函数以及用 `spyOn` 来监控`window.addEventListener`函数。`handleEvent`函数被调用时传入了这个模拟的 callback。
2. 然后触发了一个`click`事件，
3. 断言`window.addEventListener`是否被带有正确参数调用。断言`mockCallback`是否被成功调用。

最后，不要忘记在测试结束后用`mockRestore()`来恢复任何被模拟的函数，以确保不会影响到其他的测试。
## 测试浏览器窗口变化 resize
浏览器窗口变化监听的是 resize 事件，所以跟事件监听的测试方法很类似，因为颗粒度更大，不需要用 `spyOn` 来监控`window.addEventListener`函数
```ts
export function onWindowResize(callback: Function) {
  window.addEventListener('resize', () => {
    callback()
  })
}
```


```ts
describe('测试浏览器窗口变化', () => {
  it('测试浏览器窗口变化 resize', () => {
    const mockCallback = vi.fn()
    // 注册窗口大小改变事件的处理程序
    onWindowResize(mockCallback)
    // 更改窗口大小
    window.innerWidth = 1024
    window.innerHeight = 768
    // 触发 resize 事件
    window.dispatchEvent(new Event('resize'))
    // 断言回调函数被调用
    expect(mockCallback).toBeCalled()
  })
})
```
1. 先创建了一个模拟的`mockCallback`函数，让`onWindowResize`回调
2. 然后`dispatchEvent`一个`resize`事件，
3. 断言`mockCallback`是否被成功调用。

## 测试屏幕设备
我们的项目如果需要兼容 `pc` 或者 `mobile`，大概率会封装一个公共方法来做移动端和 pc 端判断，如下

```ts
function isMobileView() {
  return window.matchMedia('(max-width: 768px)').matches;
}

```

```ts
describe('isMobileView', () => {
  beforeEach(() => {
    // 清除所有之前的模拟
    vi.restoreAllMocks()
  })

  it('模拟窗口宽度小于 768px 的环境', () => {
    // 模拟窗口宽度小于 768px 的环境
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
      return {
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }
    })

    // 执行函数并断言其返回 true
    const result = isMobileView()
    expect(result).toBe(true)
  })

  it('模拟窗口宽度大于 768px 的环境', () => {
    // 模拟窗口宽度大于 768px 的环境
    const mockMatchMedia = vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
      return {
        matches: false
      }
    })

    const result = isMobileView()
    expect(result).toBe(false)
  })
})
```
1. 用 `spyOn` 来监控 `matchMedia` 方法。`handleEvent`函数被调用时传入了这个模拟的 callback。
2. 然后调用`isMobileView`方法，`isMobileView` 会用到 `matchMedia`
3. 断言`matchMedia`是否返回 `true` 或者 `false`。

## 测试 setTimeout / setInterval
因为内容较多，前面详细讲过具体的


## 测试 document 元素的获取
这是一个给元素添加一个样式的方法,获取元素之后，调用 add 方法添加一个 `active`的类名
```ts
function addActiveClass(selector: string) {
  const element = document.querySelector(selector)
  if (element) {
    element.classList.add('active')
  }
}

```
```ts
describe('测试样式', () => {
  it('元素成功添加 active ', () => {
    // 创建一个假的元素和classList对象
    const fakeElement = {
      classList: {
        add: vi.fn()
      }
    }
    // 用 spyOn 来监控 querySelector 的调用，并让它返回我们的假元素
    const spy = vi.spyOn(document, 'querySelector').mockReturnValue(fakeElement)
    // 调用被测试的函数
    addActiveClass('.my-selector')
    // 断言 querySelector 被正确调用
    expect(spy).toHaveBeenCalledWith('.my-selector')
    // 断言 classList.add 被带有正确参数调用
    expect(fakeElement.classList.add).toHaveBeenCalledWith('active')
    // 恢复原始实现
    spy.mockRestore()
  })
})

```
1. 用 `spyOn` 来监控 `querySelector` 的调用，并让它返回我们的假元素
2. 调用被测试的函数`addActiveClass`，它会使用到元素相关的方法
3. 断言 `querySelector` 被正确调用，断言 `classList.add` 被带有正确参数调用

## 其他全局方法
我们再来列举几个 case , 复习一下如何对全局方法进行测试，具体的步骤，大家可以在心中回想一下是哪三步。
```ts
describe('其他 全局', () => {
  it('其他 全局', () => {
    // 模拟window.alert
    window.alert = vi.fn();
    window.alert('Test Alert');
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith('Test Alert');

    // 使用 spyOn 监控 Number.isInteger
    const isIntegerSpy = vi.spyOn(Number, 'isInteger');
    const result = Number.isInteger(10);
    expect(result).toBe(true);
    expect(isIntegerSpy).toHaveBeenCalledTimes(1);
    expect(isIntegerSpy).toHaveBeenCalledWith(10);

  });
});
```
## 总结
测试全局浏览器方法基本就分四步
1. 使用  `vi.fn` 和 `vi.spy` mock 全局方法, 对于一些可能会有返回值的方法，优先使用 `vi.spy`，对于全局没有副作用的，或者`vi.spy`不成功的，使用`vi.fn`，类似 `reload`,
2. 执行 mock 函数
3. 断言 mock 函数是否被调用
4. 清除 mock 

