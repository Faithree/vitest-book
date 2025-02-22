# 断言常用方法
## 断言常用方法
断言最核心的就是 ```expect``` 和后面的 ```toXXX``` ，我们在前一章看过最简单的`toBe` 语法，随着更多的数据结构出现，vitest 根据 `JS` 不同的数据结构类型，有不同的断言方法，下面我们来详细学习了解下。

### 万能 `toBe`
 `toBe` 可用于断言基元是否相等或对象共享相同的引用。 它相当于调用 `expect(Object.is(3, 3)).toBe(true)`。
 
```ts
  it('test toBe ', () => {
    const stock = {
      type: 'apples',
      count: 13
    }

    expect(stock.type).toBe('apples')
    expect(stock.count).toBe(13)
    const refStock = stock
    expect(stock).toBe(refStock)
  })
```
### not 
使用 `not` 将否定该断言。 例如，此代码断言 `1` 值不等于 `2`。 如果相等，断言将抛出错误，测试将失败。
```ts
  it('test not toBe ', () => {
    expect(1).not.toBe(2)
  })
```
 
 ## 基本数据类型断言
 
 ### 数字比较大小
 * `toBeGreaterThan` 大于预期结果
 * `toBeLessThan` 小于预期结果
 * `toBeGreaterThanOrEqual` 大于等于预期结果
 * `toBeLessThanOrEqual` 小于等于预期结果
 
 ```ts
   it('test 数字 ', () => {
    expect(10 + 10).toBe(20)
    // not
    expect(10 + 10).not.toBe(30)
    // >
    expect(3).toBeGreaterThan(2)
    // <
    expect(3).toBeLessThan(4)
    expect(3 < 4).toBe(true)

    // >=
    expect(3).toBeGreaterThanOrEqual(3)
    expect(3).toBeGreaterThanOrEqual(2)
    expect(3 >= 3).toBe(true)
    expect(3 >= 2).toBe(true)
    // <=
    expect(3).toBeLessThanOrEqual(3)
    expect(3).toBeLessThanOrEqual(4)
    expect(3 <= 3).toBe(true)
    expect(3 <= 4).toBe(true)
  })
 ```
 
 ### 浮点数 `toBeCloseTo`
 
 浮点数不能直接用 `expect(0.2 + 0.1).toBe(0.3)`,因为精度问题，会导致失败，必须得用`toBeCloseTo`
 ```ts
  it.fails('test toBeCloseTo', () => {
    expect(0.2 + 0.1).toBe(0.3) // 0.2 + 0.1 is 0.30000000000000004
  })
  it('test toBeCloseTo', () => {
    expect(0.2 + 0.1).not.toBe(0.3) // 0.2 + 0.1 is 0.30000000000000004
    expect(0.2 + 0.1).toBeCloseTo(0.3)
  })
 ```
 ### toBeDefined、toBeUndefined
 * `toBeDefined` 断言值不等于 `undefined`
*  `toBeUndefined` 断言值 *is* 等于 `undefined`
 ```ts
  it('test undefined', () => {
    // undefined
    expect(undefined).toBe(undefined) // toBe 替代方式
    expect(undefined).not.toBeDefined()
    expect(undefined).toBeUndefined()
    expect('').toBeDefined()
  })
 ```
 ### toBeTruthy、toBeFalsy
 `toBeTruthy`断言值在转换为布尔值时为 true。如果你不关心值，只想知道它可以转换为`true`，也就是我们所说的真值，例如1、{}，而不仅仅是 true
 ```ts
  it('test Boolean ', () => {
    // boolean true
    expect(!!2).toBe(true) // toBe 替代方式
    expect(true).toBeTruthy()
    expect(1).toBeTruthy()
    expect({}).toBeTruthy()
    expect([]).toBeTruthy()

    // boolean false
    expect(!!'').toBe(false) // toBe 替代方式
    expect(0).toBeFalsy()
    expect('').toBeFalsy()
    expect(null).toBeFalsy()
    expect(undefined).toBeFalsy()
    expect(NaN).toBeFalsy()
    expect(false).toBeFalsy()
  })
 ```
 ### toBeNull
 `toBeNull` 断言某些内容是否为 `null`
 ```ts
  it('test null', () => {
    expect(null === null).toBe(true) // toBe 替代方式
    expect(null).toBeNull()
  })
 ```
 
看到这里，你会发现基本数据类型大部分都能用 toBe 去替代，

##  引用类型断言
###  toEqual、toStrictEqual
`toEqual` 断言实际值是否等于接收到的值，或者如果它是一个对象，则是否具有相同的结构（递归比较它们）。如果对象某个属性是 undefined 时，会自动忽略该属性。我们可以通过以下示例看到 `toEqual` 与 [`toBe`](https://cn.vitest.dev/api/expect.html#tobe) 之间的区别：

```ts
  it('test toEqual', () => {
    const stockBill = {
      type: 'apples',
      count: 13
    }
    const stockMary = {
      type: 'apples',
      count: 13
    }
    const stockBill2 = {
      type: 'apples',
      count: 13,
      name: undefined
    }
    const stockMary2 = {
      type: 'apples',
      count: 13
    }
    expect(stockBill).toEqual(stockMary)
    expect(stockBill).not.toBe(stockMary)

    expect(stockBill2).toEqual(stockMary2)
    expect(stockBill2).not.toBe(stockMary2)
  })
```
 `toStrictEqual ` 与 [`.toEqual`](https://cn.vitest.dev/api/expect.html#toequal) 的区别：

-   检查具有 `undefined` 属性的键。 例如 使用 `.toStrictEqual` 时， `{a: undefined, b: 2}` 与 `{b: 2}` 不匹配。
-   检查数组稀疏性。 例如 使用 `.toStrictEqual` 时， `[, 1]` 与 `[undefined, 1]` 不匹配。
-   检查对象类型是否相等。 例如 具有字段 `a` 和 `b` 的类实例不等于具有字段 `a` 和 `b` 的文字对象。
 ```ts
  it('test toStrictEqual', () => {
    const stockBill = {
      type: 'apples',
      count: 13,
      name: undefined
    }
    const stockMary = {
      type: 'apples',
      count: 13
    }
    class Stock {
      type: any
      constructor(type: any) {
        this.type = type
      }
    }
    expect(stockBill).not.toStrictEqual(stockMary)
    expect([1]).not.toStrictEqual([undefined, 1])
    expect(new Stock('apples')).not.toStrictEqual({ type: 'apples' })
  })
 ```
 ### toContain
 `toContain` 断言实际值是否在数组中。`toContain` 还可以检查一个字符串是否是另一个字符串的子串，此断言还可以检查类是否包含在 `classList` 中，或一个元素是否包含在另一个元素中。
 ```ts
  it('test toContain', () => {
    expect(['apple', 'orange']).toContain('orange')
    expect('123abc123').toContain('123abc')
    // const element = document.querySelector('#el')
    // expect(document.querySelector('#wrapper')).toContain(element)
  })
 ```
 ### toHaveProperty
 `toHaveProperty` 断言对象是否具有提供的引用 `key` 处的属性。
 ```ts
  it('test toHaveProperty', () => {
    expect({ name: 'xxx', age: 10 }).toHaveProperty('name')
  })

 ```
 ### toMatchObject
 `toMatchObject` 断言对象是否匹配另一个对象的部分属性。类似之前数组的toContain，对象会从最外层开始比较，如果最外层就找不到，就会直接失败
 ```ts
  it('test toMatchObject', () => {
    expect([{ foo: 'bar' }, { baz: 1 }]).toMatchObject([{ foo: 'bar' }, { baz: 1 }])
    expect({ obj: { name: 'xxx' }, height: 10 }).toMatchObject({ height: 10 })
    expect({ obj: { name: 'xxx' }, height: 10 }).not.toMatchObject({ name: 'xxx' })
  })
 ```
 
 ## Error 断言
 捕获错误的一个断言方法，例如在一些抛出错误，表单检验、数据格式错误、`try...catch` 等场景下会用到
 
```ts
  it('test Error ', () => {
    expect(() => {
      JSON.parse('{')
    }).toThrow()
  })
```
## 快照断言
快照可以理解成，把对象的结构或者基础数据类型转换成字符串，然后做一个拍照存档的概念，一般用于记录，其实就是一个偷懒的行为。例如我有一个盒子，里面有一个苹果，我拍照记录了，下次如果盒子里面放了梨，那就代表盒子被别人动过了，用例就会失败了
### toMatchInlineSnapshot
`toMatchInlineSnapshot` 用于行内快照断言，它适合小范围,少量的数据结构存储
```ts
  it('test toMatchInlineSnapshot', () => {
    const data = { foo: new Set(['bar', 'snapshot']) }
    expect(data).toMatchInlineSnapshot(`
      {
        "foo": Set {
          "bar",
          "snapshot",
        },
      }
    `)
    expect(22).toMatchInlineSnapshot('22')
    expect(true).toMatchInlineSnapshot('true')
    expect([1, 2, 3]).toMatchInlineSnapshot(`[
  1,
  2,
  3,
]`)
    expect({ name: 'xxx' }).toMatchInlineSnapshot(`{
  "name": "xxx",
}`)
  })
```
### toMatchSnapshot 
`toMatchSnapshot` 快照断言会生成一个文件，它适合一些大型的，长久不变更的地方，例如对配置文件进行快照或者如果使用一些远程图标库 `icon`，我们可以对 icon 地址进行快照，这个文件如果变更了，就会出现报错，报错就代表有风险，需要谨慎操作。
```ts
  it('test toMatchSnapshot', () => {
    const config = { url: 'url', domain: 'domain', analysis: 'analysis alias' }
    expect(config).toMatchSnapshot()
  })
```

例如上面的用例执行了之后，会生成一个文件 `__snapshots__/expect.test.ts.snap`，文件上一次快照生成时候的样子

![image.png](/4.1.jpg)


如果这个配置文件某天被某个小可爱不小心修改了，那就会报错，用例就通过不了，需要二次确认

![image.png](/4.2.jpg)


然后在命令行输入 u 二次确认之后就可以通过了

![image.png](/4.3.jpg)

## 函数断言

* `toHaveBeenCalled` 判断函数是否被调用
* `toHaveBeenCalledTimes` 判断函数被调用的次数
* `toHaveBeenCalledWith` 判断函数被调用的时候传递了什么参数

上面的断言在执行之前，要先使用`vi.spyOn`对原函数进行调用, 例如下面例子的`vi.spyOn(market, 'buy')`
```ts
  it('test function ', () => {
    const market = {
      buy(subject: string, amount: number) {
        // ...
      }
    }
    const buySpy = vi.spyOn(market, 'buy')
    expect(buySpy).not.toHaveBeenCalled()
    market.buy('apples', 10)
    market.buy('apples', 10)
    expect(buySpy).toHaveBeenCalled()
    expect(buySpy).toHaveBeenCalledTimes(2)
    expect(buySpy).toHaveBeenCalledWith('apples', 10)
  })
```
又或者使用 `vi.fn` 创建一个假函数，现在大家还不知道 `vi.spyOn` 和 `vi.fn` 的含义，但后面我会在 mock 章节专门讲解，大家也可以提前去官网查看 `api` 预习
```ts
 const mockFunction = vi.fn();
    mockFunction();
    expect(mockFunction).toHaveBeenCalled()
    expect(mockFunction).toHaveBeenCalledTimes(1)
    expect(mockFunction).toHaveBeenCalledWith()
```



### 函数副作用
在编程中，函数副作用是指函数在计算结果之外对外部状态的任何潜在影响，例如`日期、时间、请求、浏览器平台相关的 api`，说到这，你会发现，好像本章节并没有讲到如何断言，那这些有副作用的函数如何测试呢？后面章节会仔细讲解如何在使用有副作用的外部依赖也能保证函数返回相同的值，然后再根据上面断言的方法就可以了。

## 课件地址

上面的代码，都放到了 [github](https://github.com/Faithree/vue-test-book) 上，欢迎点赞收藏，我会持续更新代码和文章，消息窗口我，或者直接加我 wechat: match124
