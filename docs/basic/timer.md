
在进行前端单元测试时，模拟时间是一项常用技术，特别是当我们的代码逻辑涉及到日期和时间的操作。Vitest 提供了一组强大的 API 来让我们可以在测试中控制和模拟时间，确保我们的测试可以在任何时刻准确运行。

不管是日期还是时间，都需要先执行  `vi.useFakeTimers()` 创建一个可以控制的时间环境，使用 `vi.useRealTimers()` 还原真实的时间环境

* `vi.useFakeTimers()`: 它将封装所有对定时器的进一步调用（如 `setTimeout` 、`setInterval` 、`clearTimeout` 、`clearInterval` 、`nextTick` 、`setImmediate` 、`clearImmediate` 和 `Date`）
* `vi.useRealTimers()`: 定时器用完后，可以调用此方法将模拟的定时器返回到其原始实现。之前调度的所有计时器都将被丢弃。

我们可以先在单元测试加上勾子
```ts
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })
```
## mock 日期
由于日期是经常变的，可能今天是2024年，明天就是2025年了，所以我们会经常用到 mock 时间
* `vi.getRealSystemTime()` 获取系统真实日期时间
* `vi.getMockedSystemTime()`获取 mock 日期时间
* `vi.setSystemTime` 设置假的系统日期和时间


我们可以用 `setSystemTime` 定义一个假的当前运行环境内的日期为`1998-11-19`, 然后再去做日期相关的操作
```ts
describe('mock Date', () => {
  let date: Date
  beforeEach(() => {
    date = new Date(1998, 11, 19)
    vi.useFakeTimers()
    vi.setSystemTime(date) // mock 当前运行的测试时间为 new Date(1998, 11, 19)
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  it('mock setSystemTime', () => {
    expect(new Date()).toEqual(date)
    expect(vi.getMockedSystemTime()).toEqual(date)
    expect(vi.getMockedSystemTime()).toEqual(new Date(1998, 11, 19))
  })
})

```


## mock 时间
* `vi.runAllTimers`
* `vi.advanceTimersByTime`
* `vi.advanceTimersToNextTimer`
* `vi.runOnlyPendingTimers`
### runAllTimers
` vi.runAllTimers()` 该方法将调用每个已经启动的定时器，直到定时器队列为空。这意味着在 `runAllTimers` 期间调用的每个定时器都会被触发。如下 demo ， 因为 `setTimeout` 分别需要等待 5 秒和 15 秒，runAllTimers 相当于自动快进了时间，跳过 15 秒,直接运行 mockFn 函数,且运行了两次
```ts
  it('setTimeout timer', () => {
    vi.useFakeTimers()
    const mockFn = vi.fn()

    setTimeout(mockFn, 5000)
    setTimeout(mockFn, 15000)
    vi.runAllTimers()

    expect(mockFn).toBeCalledTimes(2)
  })
```

### advanceTimersByTime(interval)
`vi.advanceTimersByTime()`接收一个毫秒数，它代表的是你想在测试中快进的时间。当你调用这个函数时，所有当前排队的定时器（setTimeout, setInterval等）会被快进指定的时间量。如果这段时间内有定时器应该被触发，它们将会被执行。如下 demo， setInterval 每秒会调用一次 callback, 我们每次调用`vi.advanceTimersByTime(1000)`，相当于手动推进时间 1000 毫秒，每次就执行一次 callback, 就不会一直执行

```ts
function startInterval(callback, ms) {
  const intervalId = setInterval(callback, ms)
  return intervalId
}
  it('单个 setInterval timer', () => {
    const callback = vi.fn()
    const ms = 1000

    // 启动 interval
    startInterval(callback, ms)

    // 快进时间，已经走了1000
    vi.advanceTimersByTime(ms)

    // 检查 callback 是否被至少调用了一次
    expect(callback).toHaveBeenCalledTimes(1)

    // 继续快进时间，已经走了第二个 1000，目前走了 2000 ms
    vi.advanceTimersByTime(ms)

    // 再次检查 callback 调用次数
    expect(callback).toHaveBeenCalledTimes(2)
  })
```
### advanceTimersToNextTimer
`vi.advanceTimersToNextTimer()`也允许你快进时间，但它不需要你指定要快进多少时间。调用这个函数时，Vitest将会自动快进时间，直到下一个定时器被触发。
```ts
  it('每次执行一次事件循环', () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()

    setInterval(() => mockFn1(), 1000)
    setInterval(() => mockFn2(), 3000)

    expect(mockFn1).toHaveBeenCalledTimes(0)
    expect(mockFn2).toHaveBeenCalledTimes(0)

    vi.advanceTimersToNextTimer()
    expect(mockFn1).toHaveBeenCalledTimes(1)
    expect(mockFn2).toHaveBeenCalledTimes(0)

    vi.advanceTimersToNextTimer()
    expect(mockFn1).toHaveBeenCalledTimes(2)
    expect(mockFn2).toHaveBeenCalledTimes(0)

    vi.advanceTimersToNextTimer()
    expect(mockFn1).toHaveBeenCalledTimes(3)
    expect(mockFn2).toHaveBeenCalledTimes(1)
  })
```

### runOnlyPendingTimers 
`vi.runOnlyPendingTimers` 针对多个 setInterval，让等待时间最久的setInterval 被执行一次,可以使用 `vi.runOnlyPendingTimers()`，如下 demo, 有两个 setInterval,一个 1 秒执行一次，一个 5 秒执行一次，它们分别被执行了5次和一次
```ts
  it('多个 setInterval timer， ', () => {
    vi.useFakeTimers()

    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()

    setInterval(() => mockFn1(), 1000)
    setInterval(() => mockFn2(), 5000)

    vi.runOnlyPendingTimers()

    expect(mockFn1).toHaveBeenCalledTimes(5)
    expect(mockFn2).toHaveBeenCalledTimes(1)
  })
```

## 课件地址

上面的代码，都放到了 [github](https://github.com/Faithree/vue-test-book) 上，欢迎点赞收藏，我会持续更新代码和文章，消息窗口我，或者直接加我 wechat: match124
