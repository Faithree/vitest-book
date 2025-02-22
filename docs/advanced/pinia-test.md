Pinia 是 Vue.js 的另一个状态管理库，可以看作是 Vuex 的现代化替代品。它由 Vue.js 核心团队成员开发，旨在提供更简单、更灵活的状态管理方案。Pinia 的设计理念更加贴合 Vue 3 的 Composition API。


特性                  | Pinia             | Vuex                                     |
| ------------------- | ----------------- | ---------------------------------------- |
| **API 复杂度**         | 更简单，去掉了 Mutations | 较复杂，需要理解 State、Getters、Mutations、Actions |
| **TypeScript 支持**   | 原生支持，类型推断更完善      | 支持，但类型推断不如 Pinia                         |
| **模块化**             | 天生模块化，每个 Store 独立 | 需要显式定义 Modules                           |
| **Composition API** | 完全兼容，设计风格一致       | 兼容，但设计风格偏向 Options API                   |
| **体积**              | 更轻量               | 相对较大                                     |
| **Devtools 支持**     | 支持                | 支持




测试 pinia 方式也是分两种
1. 真实使用 pinia store 
2. mock 的测试方式

> 测试方式跟 vuex 很像，只要你会测试 vuex，那几乎就会测试 pinia，下面来看例子。
## 真实使用 pinia (对组件单元测试)

来看一个简单的例子 
```ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

```

### 测试 store 本身逻辑是否正常(对 store 进行单元测试)
```ts
// src/components/11/pinia.function.test.ts
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from './store'

let counter: any
beforeEach(() => {
  setActivePinia(createPinia())
  counter = useCounterStore()
})

describe('真实测试 pinia 测试函数', () => {
  it('should count 0', () => {
    expect(counter.count).toBe(0)
    expect(counter.doubleCount).toBe(0)
  })
  it('should increment count', () => {
    counter.increment()
    expect(counter.count).toBe(1)
    expect(counter.doubleCount).toBe(2)
  })

  it('should decrement count', () => {
    counter.decrement()
    expect(counter.count).toBe(-1)
    expect(counter.doubleCount).toBe(-2)
  })
  it('测试 $patch', async () => {
    counter.$patch({
      count: 100
    })
    expect(counter.count).toBe(100)
  })
})

```

### 测试 store 组件内数据渲染
日常测试中，我们是需要把 vue 组件和 store 的状态关联起来的，如何测试呢？

首先我们需要先下载一个专门测试 pinia 的库，它一个增强的 Pinia 实例
```ts
pnpm i -D @pinia/testing
```
我们先定义好一个最基本的组件结构，是一个点击+1的计时器的 Demo

```ts
<script setup lang="ts">
import { useCounterStore } from './store'
// 可以在组件中的任意位置访问 `store` 变量 ✨
const store = useCounterStore()
</script>

<template>
  <div class="store-bg">
    下面是 pinia useStore
    <button data-testid="account-button" @click="store.increment()">++按钮</button>
    数字:{{ store.count }}
    doubleCount:{{ store.doubleCount }}
    plugins:{{ store.log }}
  </div>
</template>

<style scoped>
.store-bg {
  background-color: rgb(184, 252, 249);
}
</style>

```
### 测试 initialState

通过 initialState 设置初始化的 count 为 30，则 html 渲染出来包含 30，那就是正确的预期
```ts
    const wrapper = mount(PiniaApp, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              counter: {
                count: 30
              }
            }
          })
        ]
      }
    })
    console.log('wrapper.html()', wrapper.html())
    expect(wrapper.html()).toContain(30)
  })
```
### 测试 action
默认配置 action 是 mock 函数，需要在上述的例子中，添加 `stubActions: false`，当我们模拟组件点击 increate 的时候，页面会出现 31

测试用例
```ts
    const wrapper = mount(PiniaApp, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              counter: {
                count: 30
              }
            },
            stubActions: false
          })
        ]
      }
    })
    expect(wrapper.html()).toContain(30)
    await wrapper.find('[data-testid="account-button"]').trigger('click')
    expect(wrapper.html()).toContain(31)
```
### 测试 getter
前面点击过一次 action ，所以 count 是 31，那么 doubleCount 就是 62
```ts
const doubleCount = computed(() => count.value * 2)
```
getter 主要核心是这句 
```ts
expect(wrapper.html()).toContain(62)
```

```ts
  it('测试 getter', async () => {
    const wrapper = mount(PiniaApp, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              counter: {
                count: 30
              }
            },
            stubActions: false
          })
        ]
      }
    })
    expect(wrapper.html()).toContain(30)
    await wrapper.find('[data-testid="account-button"]').trigger('click')
    expect(wrapper.html()).toContain(31)
    expect(wrapper.html()).toContain(62)
  })
```

### 测试 plugin

例如来一个简单的 myPlugin.ts 例子
```ts
// src/components/11/plugin.ts
export const myPlugin = () => ({ log: 'this is log' })

```

如果你有使用任何 pinia 插件，确保在调用 `createTestingPinia()` 时传入它们，这样它们就会被正确加载。
```ts
  it('测试 plugin ', async () => {
    const wrapper = mount(PiniaApp, {
      global: {
        plugins: [
          createTestingPinia({
            plugins: [myPlugin]
          })
        ]
      }
    })
    expect(wrapper.html()).contain('this is log')
  })
```
## mock pinia

### mock state 和 action
因为我们装了`@pinia/testing` 插件，默认情况下，**所有的 action 都是 mocked 的** ，所以要比 vuex 方便得多，有个地方要注意的是，mock pinia 的时候，要先 `mount` 组件，再去 `useCounterStore()`，顺序不能反了


* mock state 可以用 `initialState` 代替
* mock action 在不配置`stubActions: false`， 直接调用 action 就已经是一个 mock 函数了

![image.png](/13.1.jpg)

```ts
beforeEach(() => {
  setActivePinia(createPinia())
  wrapper = mount(PiniaApp, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            counter: {
              count: 30
            }
          }
        })
      ]
    }
  })
  counter = useCounterStore()
})

describe('mock 测试 pinia 组件', async () => {
  it('测试 mock action', async () => {
    console.log('counter.increment', counter.increment) // 默认就是一个 mock action
    counter.increment();
    expect(counter.increment).toHaveBeenCalledTimes(1)
  })
  it('结合组件测试 mock action', async () => {
    expect(wrapper.html()).toContain(30)
    await wrapper.find('[data-testid="account-button"]').trigger('click')
    expect(counter.increment).toHaveBeenCalledTimes(1)
  })
})

```
### mock $patch
createTestingPinia 需要添加参数 stubPatch
```ts
    createTestingPinia({
      stubPatch: true
    })
```
```ts
  it('结合组件测试 mock $patch', async () => {
    counter.$patch({
      count: 100
    })
    // console.log('counter.$patch', counter.$patch) //  mock $patch
    expect(counter.$patch).toHaveBeenCalledTimes(1)
    expect(counter.$patch).toHaveBeenCalledWith({
      count: 100
    })
  })
```


学到这里， vue 全家桶的测试就已经完全掌握了，在实际开发中，可以按照自己的喜好和风格，去灵活使用测试真实的页面数据，还是只测试 mock 数据，反正只要管理好 expect 预期就好了.