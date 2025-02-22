开篇先提一个问题，什么是 mock？，各位先想想。
前一章节，我们详细了介绍了 vue 单元测试所用到的一些测试方法，但每一个测试 case,最终都会渲染出来真实的组件，再依据真实组件去做断言。
在单元测试中，遵循最小化原则，我们测一个组件，如果想快速的写完单元测试，就没有必要把所有组件都渲染出来。又或者测试用例的编写不想收到各种第三方库的干扰，我们就需要 mock 一些数据，这些数据可以是函数、日期、环境参数、组件、请求数据等等
## mock 优点
上述出现那么多种 mock 根本原因是，测试的环境很难做到跟真实运行的环境一样，只能通过 mock 去尽量靠近真实的环境，使用 mock 会有下面几点优点
* 更快的测试速度
* 减少环境依赖，避免风险和干扰
* 更快的编写单元测试


## mock函数
###  vi.fn
`vi.fn()` 创建一个新的模拟函数。这个函数可以在测试中作为任何需要通过函数验证行为的地方使用。当你需要一个没有具体实现的通用函数，或者当你想要捕捉函数调用及其参数的信息而不关心该函数是从哪里来的时候，你会用到`vi.fn()`。


例如那么我们就可以用`vi.fn`定义一个假的`requestFn`函数，这个`requestFn`可以记录是否被调用，调用参数是什么,也可以设置任何假的返回值。我们不需要关注他是不是真的发送请求给后端
```ts
  it('vi.fn function', async () => {
    const requestFn = vi.fn((url: string, params: string) => {
      return {
        data: {
          name: 'xxx'
        }
      }
    })

    // 测试代码中调用模拟函数
    requestFn('/url', 'params')

    // 断言模拟函数的调用信息
    expect(requestFn).toHaveBeenCalled()
    expect(requestFn).toHaveBeenCalledWith('/url', 'params') // 被调用的时候参数是 '/url', 'params'  })
    expect(requestFn('/url', 'params')).toEqual({
      data: {
        name: 'xxx'
      }
    })
  })
```

### vi.spyOn

`vi.spyOn()` 用于创建一个模拟函数，并且连接到对象的方法上。`vi.spyOn()` 允许你监控一个对象上的已有方法的调用情况，而不改变其实现。这在你需要保持原有代码行为同时捕获该函数调用信息时是非常有用的。

可以理解成代理，例如下面有一个 `getApples` 函数，但在调用的时候，被一个假的`getApples`给拦截了，充当真的 getApples 函数,但这个真的 apples 函数也会被执行到，有点像是ES6 `proxy` 的感觉，它也可以记录是否被调用，调用参数是什么,也可以设置任何假的返回值。
```ts
  it('vi.spyOn function', async () => {
    const cart = {
      getApples: () => {
        console.log('getApples 被执行了') // 假的函数也会被执行到
        return 42
      }
    }

    const spy = vi.spyOn(cart, 'getApples')
    cart.getApples()
    expect(cart.getApples()).toBe(42) // 假的函数也会被执行到
    expect(spy).toHaveBeenCalled()
  })
```
* vi.fn 是创建一个新的假函数去代替旧的函数，是代替
* vi.spyOn 是拦截了旧函数，并且代理了旧函数调用,并且旧函数也会被执行，是拦截代理

### mock 实例
`vi.fn` 和 `vi.spyOn` 创建的函数有一些公共方法，下面列举常用的

* 多次修改 mock 函数的返回值，可以使用`mockImplementation`、`mockReturnValue`、`mockResolvedValue` 其中之一，区别是一个是传递函数，一个是直接返回值,一个返回 promise
```ts
   it('vi.fn function 修改返回值', async () => {
    const requestFn = vi.fn((arg1, arg2) => 'requestFn1')
    expect(requestFn('/url', 'params')).toBe('requestFn1')

    // mockImplementation
    requestFn.mockImplementation((arg1, arg2) => 'requestFn2')
    expect(requestFn('/url', 'params')).toBe('requestFn2')

    // mockReturnValue
    requestFn.mockReturnValue('requestFn3')
    expect(requestFn('/url', 'params')).toBe('requestFn3')

    // mockResolvedValue
    requestFn.mockResolvedValue('requestFn4')
    const res = await requestFn('/url', 'params')
    expect(res).toBe('requestFn4')
  })
```

```ts
  it('vi.spyOn function  修改返回值同理', async () => {
    const cart = {
      getApples: () => 42
    }

    expect(cart.getApples()).toBe(42)
    const spy = vi.spyOn(cart, 'getApples').mockReturnValue(10)

    expect(cart.getApples()).toBe(10)
    expect(spy).toHaveReturnedWith(10)
  })
```
每次 mock 之后，防止其他 case 用了上一次 mock 出来的脏数据吗，需要重置或者清空，有以下三种方式

1.  **vi.mockReset()**

    当你调用 `vi.mockReset()`，它会重置所有模拟函数的历史记录和实现。这意味着该函数的调用次数、传递的参数、返回的值等信息都会被清除。同时，如果函数有自定义的实现（你可能在调用`vi.fn(implementation)`时提供了一些模拟逻辑），那么`vi.mockReset()`会将这个函数重置为一个没有任何实现的模拟函数。
```
  it('mockReset', async () => {
    const mockFunction = vi.fn(() => 'return value')
    expect(mockFunction()).toBe('return value')
    mockFunction.mockReset() // 清除函数的所有调用数据及其自定义实现
    expect(mockFunction()).toBe(undefined)
  })
```
2.  **vi.mockClear()**

    `vi.mockClear()`方法仅重置mock函数的调用记录，不影响其实现。如果你的模拟函数有自定义的逻辑，调用`vi.mockClear()`之后，这些自定义逻辑仍会照常工作，只是之前的调用记录不再存在。
```ts
  it('mockClear', async () => {
    const mockFunction = vi.fn(() => 'return value')
    expect(mockFunction()).toBe('return value')
    mockFunction.mockClear() // 清除函数的调用数据，保留实现
    expect(mockFunction()).toBe('return value')
  })
```
3.  **vi.mockRestore()**

    `vi.mockRestore()`是与`vi.spyOn()`一起使用的特殊方法，它不仅重置mock函数的行为和状态，还会恢复被spy函数的原始实现。这在你使用`vi.spyOn()`来监控某个对象的方法，而在测试结束时希望完全还原这个方法时特别有用。
```ts
  it('mockRestore', async () => {
    const object = { method: () => 'original return value' }
    const spy = vi.spyOn(object, 'method').mockImplementation(() => 'mocked return value')
    expect(object.method()).toBe('mocked return value')
    spy.mockRestore() // 清除调用数据，并恢复method的原始实现
    expect(object.method()).toBe('original return value')
  })
```
总之，这三个方法都是在不同场景下管理你的 mock 函数时会用到的，其中`vi.mockClear()`用于清理调用数据但保留模拟的实现，`vi.mockReset()`用于完全重置模拟函数（包括它的实现），而`vi.mockRestore()`则通常与`vi.spyOn()`配合使用，既重置函数的行为和状态，也还原任何通过spy改变过的方法的原始实现。
## mock 环境参数

## mock window 属性
```ts
  it('mock window属性', () => {
    vi.stubGlobal('innerWidth', 100)
    expect(window.innerWidth).toBe(100)
  })

```

## mock 模块
使用 `vi.mock` 来模拟一个模块，分为两大块
* mock 一个第三方 npm 包
* mock 本地工具函数
### mock 一个第三方 npm 包
接下来我们要测试我们自己的基于第三方库 axios 封装的 request 方法
```ts
import axios from 'axios'
export function request(url: string, params: any) {
  // 基于 axios 做各种封装
  return axios.get(url, params)
}

```
```ts
import { request } from './request'
import axios from 'axios'
it('mock 一个第三方 npm 包', async () => {
    vi.mock('axios')
    const mockedAxios = axios
    mockedAxios.get.mockResolvedValue({ data: 'mocked data' })

    // Call the function with a test param
    const result = await request('test-param', {})

    // Assert that axios.get was called with the correct param
    expect(mockedAxios.get).toHaveBeenCalledWith('test-param', {})

    // Assert that the function returns the correct data
    expect(result).toEqual({ data: 'mocked data' })
})
```
### mock 模块中的部分方法
`vi.mock` 一个模块的时候，会把当前的 mock代码模块提升到文件的最顶层，如果直接 mock 一个函数代替导入模块中的其中一个函数，mock 出来的函数会不生效（因为mock的时候，是运行阶段，文件已经在编译阶段被导入了）,

有三个请求方法，引入了上面基于 axios 封装的 request 请求方法，在测试的时候，我们并不需要再次验证 request  里面的内部逻辑，只需要保证能否请求回来数据即可，那就需要 mock 请求回来的数据
```ts
import { request } from './request'

export function getList(params: string) {
  return request('/getList', params)
}
export function getAge(params: string) {
  return request('/getAgeList', params)
}
export function getName(params: string) {
  return request('/getName', params)
}

```


```ts
import { getList } from './request'

  it('mock 模块中的一个函数', () => {
    vi.mock('./utils', async () => {
      return {
        ...((await vi.importActual('./utils')) as any),
        getList: vi.fn().mockReturnValue({
          data: 'mockGetList'
        })
      }
    })
    getList('xx')
    expect(getList).toHaveBeenCalledTimes(1)
    expect(getList).toHaveBeenCalledWith('xx')
    expect(getList).toHaveReturnedWith({
      data: 'mockGetList'
    })
    vi.clearAllMocks()
  })
```

还有一种写法，偶尔也能看到，这里贴一下，使用到了`vi.hoisted`,它的功能就是回调函数里面的代码，将会提升到文件最前面执行，比 import 和 `vi.mock` 还早 `（ES 模块中的所有静态 import 语句都被提升到文件顶部，因此在导入之前定义的任何代码都将在导入之后执行。）`。

```ts
import { getList } from './request'

const { mockedMethod } = vi.hoisted(() => {
  return {
    mockedMethod: vi.fn().mockReturnValue({
      data: 'mockGetList'
    })
  }
})
describe('mock 模块中的一个函数', () => {
  it('mock 模块中的一个函数的另一种常用方法', () => {
    vi.mock('./request', async () => {
      return { getList: mockedMethod }
    })
    getList('xx')
    expect(getList).toHaveBeenCalledTimes(1)
    expect(getList).toHaveBeenCalledWith('xx')
    expect(getList).toHaveReturnedWith({
      data: 'mockGetList'
    })
  })
  vi.clearAllMocks()
})

```
如果不使用 `vi.hoisted`

![image.png](/8.1.jpg)
## mock 组件
我们在测试一个组件的时候，如果他有很多子组件，子组件如果依赖其他数据或者远程数据等复杂逻辑，那会导致测试复杂度提升或者需要更多考虑子组件等边界。不符合测试的逻辑，也降低测试积极性。所以，如果我们只想要测试当前组件的逻辑，如何防止子组件渲染出来了呢？

正常我们渲染一个带子组件的父组件
```ts
<script setup lang="ts">
import StubChild from './StubChild.vue'
</script>

<template>
  <h1>i an parent component</h1>
  <StubChild></StubChild>
  <!-- 会渲染成如下 <h1>i an child component</h1> -->
</template>

```
子组件用到了 axios 去请求远程数据，势必会占用测试的时间和增加测试的复杂性。
```ts
<script setup lang="ts">
import axios from 'axios'
import { onMounted } from 'vue'

onMounted(() => {
  axios.get('www.baidu.com');
})
</script>

<template>
  <h1>i an child component</h1>
</template>

```
```ts
  it('mount', async () => {
    const wrapper = mount(StubParent)
    // 组件和会渲染成如下
    // <h1>i an parent component</h1>
    // <h1>i an child component</h1>
    console.log(wrapper.html())
  })
```
我们可以通过stub 参数，把子组件用一个假的替身替代,如果有多个，那就写多个 true
```ts

    const wrapper = mount(StubParent, {
      global: {
        stubs: {
          StubChild: true
          // A组件名:true
          // B组件名:true
        }
      }
    })

    // 直接渲染
    // <h1>i an parent component</h1>
    // <h1>i an child component</h1>
    expect(wrapper.html()).toMatchInlineSnapshot(`"<h1>i an parent component</h1>
<stub-child-stub></stub-child-stub>"`)
```
组件就会被渲染成 ```<stub-child-stub></stub-child-stub>```
如果有多个子组件，除了使用上面的写法，还有个更加简单的写法,浅渲染模式，默认就会把当前组件的所有子组件都不渲染出来，但这种方式不能自定义渲染内容，

```ts

    const wrapper = mount(StubParent, {
      shallow: true
    })
```
如果用了 ```shallow: true```但希望某个子组件会真实渲染出来
```ts
   const wrapper = mount(StubParent, {
      shallow: true,
      global: {
        stubs: { StubChild: false } // 其中某个子组件会真实渲染出来
      }
    })
```
如果想自定义子组件渲染的内容，可以写成如下
```ts
    const wrapper = mount(StubParent, {
      global: {
        stubs: {
          StubChild: {
            template: '<span />'
          }
        }
      }
    })
    
  // <h1>i an parent component</h1>
  // <span></span>
```
## mock teleport
上节课我们知道，直接 mount 一个带有 teleport 组件是不会渲染出来的，如果我们不想测试交互，就只想测试内容是否被渲染出来，可以直接 mock teleport,
```ts
test('mock teleport', async () => {
  const wrapper = mount(Teleport, {
    global: {
      stubs: {
        teleport: true
      }
    }
  })
  console.log(wrapper.html())
  const signup = wrapper.getComponent(Signup)
  await signup.get('input').setValue('valid_username')
  await signup.get('form').trigger('submit.prevent')

  expect(signup.emitted().signup[0]).toEqual(['valid_username'])
})
```


![image.png](/8.2.jpg)

## mock 指令
有时，指令会做一些相当复杂的事情，比如执行大量 DOM 操作,业务测试并不会测试指令（上节课介绍过专门测试指令）
```ts
  it('tooltip', async () => {
    const wrapper = mount(Directive, {
      global: {
        directives: {
          tooltip: vTooltip
        },
        stubs: {
          vTooltip: true
        }
      }
    })
```

## mock 全局方法和属性
如果我们用到一些全局的方法或者属性，在 template 里是可以直接使用的，但测试当前组件的时候，组件是会报错的。因为全局函数一般都是单独的单元测试，我们并不需要在当前组件里面去测试，往往需要跳过
```ts
app.config.globalProperties.$myGlobalMethod = $myGlobalMethod
app.config.globalProperties.$myGlobalParams = '$myGlobalParams'
```
```ts
<script setup lang="ts">

</script>

<template>
  <h1>i an child component</h1>
  {{ $myGlobalMethod('member-info') }}
  {{ $myGlobalParams }}
</template>

```


![image.png](/8.3.jpg)


我们需要 mocks 全局属性和方法，全局属性和方法，类似 $route,$store，直接在 template 上用到，但当前组件没有引用的方法
```ts
  it('mock 组件template上用到的全局属性和方法', async () => {
    // 创建 mocks 对象
    const mockMethod = vi.fn().mockReturnValue('mocked $myGlobalMethod')
    const wrapper = mount(MockInstance, {
      global: {
        mocks: {
          // 使用 mock 函数而不是实际的 $myGlobalMethod
          $myGlobalMethod: mockMethod,
          $myGlobalParams: 'mock $myGlobalParams'
        }
      }
    })
    // 现在 $myGlobalMethod 已经被 mock 了，我们可以断言它被调用
    expect(mockMethod).toHaveBeenCalled()
    expect(mockMethod).toHaveBeenCalledWith('member-info')
    // 检查渲染后的 HTML 是否包含了 mock 方法的返回值
    expect(wrapper.html()).toContain('mocked $myGlobalMethod')
  })
```

![image.png](/8.4.jpg)


特别说明一下，`$myGlobalMethod`虽然是使用 vi.fn 返回的替身函数，但也可以用一个真实的函数去真实渲染数据
```ts
  it('mock 组件template上用到的全局属性和方法，也可以是真实方法', async () => {
    const $t = ()=>{
      return '我是 i18n ，可能会渲染中文或者英文'
    }
    const wrapper = mount(MockInstance, {
      global: {
        mocks: {
          // 使用 mock 函数而不是实际的 $myGlobalMethod
          $myGlobalMethod: $t,
          $myGlobalParams: 'mock $myGlobalParams'
        }
      }
    })
    expect(wrapper.html()).toContain('我是 i18n ，可能会渲染中文或者英文')
    expect(wrapper.html()).toContain('mock $myGlobalParams')
  })
```

## 课件地址

上面的代码，都放到了 [github](https://github.com/Faithree/vue-test-book) 上，欢迎点赞收藏，我会持续更新代码和文章，消息窗口我，或者直接加我 wechat: match124
