**Vuex** 是 Vue.js 生态中非常重要的状态管理工具，特别适合中大型应用。它通过集中式管理状态，使得应用的状态变化更加清晰和可控。

测试 vuex 方式也是分两种
1. 真实使用 vuex store 
2. mock 的测试方式

真实渲染一般用于比较简单的项目上，因为我们需要经常在 store 里面去 dispatch 一些副作用，如果真实渲染，会有异步、数据等影响.

> 只要你学会了测试 vue-router，那测试 vuex 就是顺手的事情。下面来看例子。
> 
## 真实使用 vuex store
来看一个简单的例子 


```ts
// store.ts
import type { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

export interface State {
  count: number
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    count: 0
  },
  mutations: {
    increment(state: any) {
      state.count += 1
    }
  }
})

// 定义自己的 `useStore` 组合式函数
export function useStore() {
  return baseUseStore(key)
}


```
测试的时候有两种 mount 方式 注入 store ，一种是 plugins 注入，一种是 provide 的方式，功能都一样，我这边推荐 plugins 

```ts
  const wrapper = mount(Store, {
      global: {
        provide: {
          [key]: store
        }
      }
    })
```

```ts
    const wrapper = mount(Store, {
      global: {
        plugins: [[store, key]]
      }
    })

```
### 测试 store 本身逻辑是否正常
因为 store 就是一个函数，测试数据正常，就只需要调用这个对象暴露的方法

```ts
 it('测试 store 本身数据是否正常', async () => {
    expect(store.state.count).toBe(0)
    store.commit('increment')
    expect(store.state.count).toBe(1)
    store.commit('increment')
    expect(store.state.count).toBe(2)
  })
```

### 测试 store 组件内数据渲染
我们先来写一个简单的组件,逻辑就是计时器 +1
```ts
//src/components/10/StoreApp.vue
<script setup lang="ts">
import { useStore } from './store'
const store = useStore()
console.log('store', store)

</script>

<template>
  <div class="store-bg">
    下面是 vuex useStore
    <button data-testid="account-button" @click="store.commit('increment')">++按钮</button>
    数字:{{ store.state.count }}
  </div>
</template>

<style scoped>
.store-bg {
  background-color: rgb(255, 237, 203);
}
</style>

```
测试的逻辑就是，点击之后，触发 action，页面上渲染的数字从 0 变成 1
```ts
  it('测试 store 组件内数据渲染', async () => {
    const wrapper = mount(Store, {
      global: {
        plugins: [[store, key]]
      }
    })
    expect(wrapper.html()).toContain(0)
    await wrapper.find('[data-testid="account-button"]').trigger('click')
    expect(wrapper.html()).toContain(1)
  })
```


## mock vuex
mock store，我们可以通过前面学到的 mock 模块方法，来 mock `useStore`,直接来 mock 一个 store 文件里面的 useStore 和 commit 方法

```ts

import { mount } from '@vue/test-utils'
import Store from './Store.vue'
const commit = vi.fn()

vi.mock('./store.ts', async () => {
  return {
    ...((await vi.importActual('./store.ts')) as any),
    useStore: () => ({
      state: {
        count: 0
      },
      commit: commit
    })
  }
})

describe('真实测试 vuex ', () => {
  it('测试 store 组件内数据渲染', async () => {
    const wrapper = mount(Store)
    console.log('wrapper.html()', wrapper.html())
    expect(wrapper.html()).toContain(0)
    await wrapper.find('[data-testid="account-button"]').trigger('click')
    expect(commit).toHaveBeenCalled()
    expect(commit).toHaveBeenCalledWith('increment')
  })
})
```
mock vuex 的方式很像 vue-router, 本质来说 vuex、vue-router都是挂到插件上，其实就是一个函数，我们只要回顾我们在 mock 那一章节 如何 mock 模块中部分函数的做法，就可以了

## 课件地址

上面的代码，都放到了 [github](https://github.com/Faithree/vue-test-book) 上，创作不易，免费的同时希望大家点赞收藏给我动力，我会持续更新代码和文章，消息窗口我，或者直接加我 wechat: match124
