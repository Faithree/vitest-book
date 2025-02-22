
## 前置知识
### 观念改变
在这一章，会讲到如何测试组件，我在这一章只讲组件测试的基本操作，不会去讲测试的心法，后面章节再专门讲测试的心法，我会带着大家，把复杂的业务点，拆成一个一个细点，让大家先把测试用例写出来，后面再考虑写不写得好。就好像先学 typescript 基本的类型操作就能覆盖日常开发的 90%，想把 typescript 写的更好，那就得学typescript 体操，而 typescript 体操平时开发可能只占不到 10%

### 异步

在JavaScript中执行异步代码是很常见的，我们前面学的 it 上下文，是一个同步的上下文，在我们测试组件的时候，尤其是 vue 更新 setData 的时候，是异步的。这就需要在一个异步的 it 上下文中执行断言代码

之前我们学过的同步上下文
```ts
  it('mount first render', () => {
   
  })
```

异步上下文只需要加一个 async，然后就可以使用 await，类似 js 的 `async await` 用法一样
```ts
  it('update multiple render', async () => {
    // async await
    await nextTick()
  })
```


## 如何设置 Data

我们之前说了 mount 和 shallowMounnt, 其实 mount 还有第二个参数，可以设置

```ts
<script setup lang="ts">
import { ref } from 'vue'
const str = ref('')
</script>

<template>
  <div>{{ str }}</div>
</template>

```
```ts
  it('mount', async () => {
     const wrapper = mount(Data, {
      setup() {
        return {
          str: 'first render'
        }
      }
    })
    expect(wrapper.text()).toContain('first render')
})
```
但我们日常业务还是极少会手动设置 data,往往是mount勾子里面去修改data

### 如何解决 mount 之后的数据变化？
```ts
<script setup lang="ts">
import { onMounted, ref } from 'vue'
const str = ref('first render')
onMounted(()=>{
  str.value = 'second render'
})
</script>

<template>
  <div>{{ str }}</div>
</template>

```
因为勾子函数异步更新了 str，所以需要使用`await nextTick()`等待更新完成之后再断言

```ts
  it('mount', async () => {
    const wrapper = mount(Data, {})
    expect(wrapper.text()).toContain('first render')
    await nextTick()
    console.log('wrapper.text()', wrapper.html())
    expect(wrapper.text()).toContain('second render')
  })
```
### 如何临时修改组件的值？
```ts
  it('mount', async () => {
    const wrapper = mount(Data, {})
    expect(wrapper.text()).toContain('first render')
    await nextTick()
    expect(wrapper.text()).toContain('second render')

    wrapper.vm.str = 'third render'
    await nextTick()
    console.log('wrapper.text()', wrapper.html())
    expect(wrapper.vm.str).toBe('third render') // data 有没有值
    expect(wrapper.text()).toContain('third render') // data 是否正确渲染在页面上
  })
```

## props
```ts
<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div>{{ msg }}</div>
</template>

```

```ts
  it('mount props', async () => {
    const wrapper = mount(Props, {
      props: {
        msg: 'props msg'
      }
    })
    expect(wrapper.text()).toContain('props msg')
  })
```
### 动态 setProps
```ts
  it('update props', async () => {
    const wrapper = mount(Props, {
      props: {
        msg: 'props msg'
      }
    })
    expect(wrapper.text()).toContain('props msg')
    await wrapper.setProps({
      msg: 'second render'
    })
    expect(wrapper.props('msg')).toBe('second render') // props 有没有值
    expect(wrapper.text()).toContain('second render') // props 是否正确渲染在页面上
  })
```

日志输出
```ts
    console.log('wrapper',wrapper.props('msg'))
```

## 如何测试 emits
要修改和添加案例
```ts
<script setup lang="ts">
interface Emits {
  (e: 'change', value: string)
  (e: 'update:pageIndex', value: number)
  (e: 'update:pageSize', value: string, size: number)
}

const emits = defineEmits<Emits>()

const resetPage = (value: string) => {
  emits('update:pageSize', value, 10)
  emits('update:pageIndex', 1)
  emits('change', value)
}
</script>

<template>
  <div @click="resetPage('customer')" data-testid="button">button</div>
</template>

```

```ts
  it('mount', async () => {
    const wrapper = mount(Emitted)
    const button = wrapper.find('[data-testid="button"]')
    await button.trigger('click')
    const emits = wrapper.emitted()
    console.log('emits', emits)
    // emits {
    //   'update:pageSize': [ [ 'customer', 10 ] ],
    //   'update:pageIndex': [ [ 1 ] ],
    //   change: [ [ 'customer' ] ],
    //   click: [ [ [MouseEvent] ] ]
    // }
    expect(emits).toHaveProperty('update:pageIndex')
    expect(emits).toHaveProperty('update:pageSize')
    expect(emits).toHaveProperty('change')
  })
```
`wrapper.emitted()` 是一个数组，可以获取到 emit 事件的记录，根据数组里面的内容去断言

## provide/inject 
父组件向下传递 `this is parent data`

Parent.vue
```ts
provide('parentValue', 'this is parent data')

```
按钮组件拿到parent 传递过来的 `parentValue` 值

Button.vue
```ts
const text = inject('parentValue')
<div> {{ text }}</div>
```
```ts
describe('测试 provide', () => {
  it('测试顶层组件渲染正确传递值给子组件', async () => {
    const wrapper = mount(Parent)
    expect(wrapper.text()).toContain('this is parent data')
  })

  it('测试子组件能拿到顶层组件传递的值', async () => {
    const wrapper = mount(Button,{
      global: {
        provide: {
          parentValue: 'test provide'
        }
      }
    })
    expect(wrapper.text()).toContain('test provide')
  })
})
```
## directive
从业务角度，从组件的角度
```ts
<script setup lang="ts">
const vTooltip = {
  beforeMount(el: Element) {
    el.classList.add('with-tooltip')
  }
}
</script>

<template>
  <div>
    <div v-tooltip data-testid="tooltip">show tooltip</div>
  </div>
</template>

```
```ts
  it('tooltip', async () => {
    const wrapper = mount(Directive)
    const tooltip = wrapper.find('[data-testid="tooltip"]')
    expect(tooltip.html()).toContain('with-tooltip')
  })
```

如果是全局的自定义指令,就得如下写法，需要在 main.ts 里面全局定义指令
```ts
// main.ts
app.directive('tooltip', vTooltip)
```

```ts
<script setup lang="ts">
</script>

<template>
  <div>
    <div v-tooltip data-testid="tooltip">show tooltip</div>
  </div>
</template>


```
测试用例需要 `directives` 注入进来
```ts
  it('tooltip', async () => {
    const wrapper = mount(Directive, {
      global: {
        directives: {
          tooltip: vTooltip
        }
      }
    })
    const tooltip = wrapper.find('[data-testid="tooltip"]')
    expect(tooltip.html()).toContain('with-tooltip')
  })
```


## components
当我们在使用一些第三方组件的时候，可能第三方组件就是全局注册的，我们就不需要在每一个组件里面每次引入使用的组件，例如我有个 `GlobalComponent` 组件，被全局注册了
```ts
import GlobalComponent from './components/6/GlobalComponent.vue'
app.component('GlobalComponent', GlobalComponent)
```
那么在使用的时候就不需要在当前组件引入了，直接使用就行
```ts
<template>
  <div>
    <GlobalComponent></GlobalComponent>
  </div>
</template>

<script setup lang="ts">
</script>

```
我们直接 mount 一下这个 
```ts

  it('mount error component', async () => {
    const wrapper = mount(Global)
    console.log(wrapper.html())
    expect(wrapper.text()).toContain('My Global Component')
  })
```

![image.png](/6.1.jpg)


需要在测试的时候，把组件注册进去
```ts
  it('mount success component', async () => {
    const wrapper = mount(Global, {
      global: {
        components: {
          GlobalComponent
        }
      }
    })
    expect(wrapper.text()).toContain('My Global Component')
  })
```
## plugins
我们再来看看 plugins， 插件很常见，vuex、vue-router 都是插件，我们如何测试插件呢，我列了一个平常可能会使用到的 i18n 插件，
```ts
// i18n.ts
const i18nPlugin = {
  install(app: any, options: PluginOptions = {}) {
    const messages = options.messages ?? {}

    app.config.globalProperties.$t = function (key: string) {
      const language = options.defaultLanguage ?? 'en'
      return messages[language]?.[key] || key
    }
  }
}

```

```html
<!-- Plugin.vue -->
<template>
  <div>{{ $t('hello') }}</div>
</template>

<script setup lang="ts">
</script>

```
main.ts 里面需要注册插件，这里我们直接定义 hello 的值是 'Hello Plugin'
```ts
app.use(i18nPlugin, {
  defaultLanguage: 'en',
  messages: {
    en: {
      hello: 'Hello Plugin'
    }
  }
})
```
```ts
describe('测试 plugin', () => {
  it('uses i18n plugin', () => {
    const wrapper = mount(Plugin, {
      global: {
        plugins: [
          [
            i18nPlugin,
            {
              defaultLanguage: 'en',
              messages: {
                en: {
                  hello: 'Hello test i18nPlugin'
                }
              }
            }
          ]
        ]
      }
    })
    expect(wrapper.text()).toBe('Hello test i18nPlugin')
  })
})

```

## attachTo
我们有时候会在组件里面直接操作 dom,例如下面一个组件一开始渲染了 `first render` onMounted之后，获取 dom 之后，直接把h4里的内容改成111
```ts
<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => {
  const ele = document.querySelector('h4') as Element
  ele.innerHTML = '111'
})
</script>

<template>
  <h4 style="color: red">first render</h4>
</template>


```
如果不使用 attachTo, 会渲染报错
```ts
  it('attach render error', async () => {
    const wrapper = mount(Attach)
    await nextTick()
    expect(wrapper.text()).toContain('111')
  })
```

![image.png](/6.2.jpg)


正确的用法是 attachTo 到 body 上面或者其他的 DOM 上
```ts
  it('attach success render', async () => {
    // const div = document.createElement('div')
    // document.body.appendChild(div)
    const wrapper = mount(Attach, {
      attachTo: document.body
      // attachTo: div // 任意一个 dom
    })
    await nextTick()
    console.log('wrapper', wrapper.html())
    expect(wrapper.text()).toContain('111')
  })
```
## teleport

Vue 3 配备了一个新的内置组件：它允许组件将其内容 "传送 "到其自身之外,当我们直接 mount 一个包含 teleport 组件的时候，是不会展示具体内容的，只会显示
```
<!--teleport start-->
<!--teleport end-->
```

如何测试呢？
MyTeleport.Vue 组件使用了  Teleport 功能，Teleport 包括了一个子组件 Signup.vue
```ts
<template>
  <Teleport to="#modal">下面渲染子组件 <Signup></Signup> </Teleport>
</template>

<script lang="ts" setup>
import Signup from './Signup.vue'
</script>

```
Signup.vue 是一个表单，用于验证用户名是否大于 8 个字符。如果大于 8 个字符，就把输入的用户名 emit 到父组件
```ts
<template>
  <div>
    <form @submit.prevent="submit">
      <input v-model="username" />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineEmits } from 'vue'

const emit = defineEmits(['signup'])

const username = ref('')

const error = computed(() => {
  return username.value.length < 8
})

const submit = () => {
  if (!error.value) {
    emit('signup', username.value)
  }
}
</script>

```
因为 teleport  到了当前组件的外部，需要额外使用 `getComponent` 或者 `findComponent`来直接获取 `Signup.vue`，然后再进行相关的断言操作
```ts
beforeEach(() => {
  const el = document.createElement('div')
  el.id = 'modal'
  document.body.appendChild(el)
})

afterEach(() => {
  document.body.outerHTML = ''
})

test('teleport', async () => {
  const wrapper = mount(Teleport)
  console.log(wrapper.html())
  const signup = wrapper.getComponent(Signup)
  await signup.get('input').setValue('valid_username')
  await signup.get('form').trigger('submit.prevent')

  expect(signup.emitted().signup[0]).toEqual(['valid_username'])
})

```

## ref
我们有时需要访问 DOM 元素或子组件，以手动操作它们，而不是依赖数据绑定，例如一个 进入页面之后，自动聚焦的输入框，如何使用 ref 自动聚焦？
```ts
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const input = ref<HTMLInputElement | null>(null)
const model = defineModel<string>()

onMounted(() => {
  input.value?.focus()
})
</script>

<template>
  <div>
    <input ref="input" v-model="model" />
  </div>
</template>

```

我们要测两点东西
1. ref 获取 input 元素存在
2. input 元素被聚焦了
```ts
import { shallowMount } from '@vue/test-utils'
import Ref from './Ref.vue'

describe('Ref', () => {
  it('自动聚焦的输入框', () => {
    const wrapper = shallowMount(Ref, {
      attachTo: document.body
    })
    const input = wrapper.find<HTMLInputElement>({
      ref: 'input'
    })
    expect(document.activeElement).toBe(input.element)
  })
})


```
## defineAsyncComponent
异步加载组件的加载可能还比较少人用过，[具体可以看看](https://vuejs.org/guide/components/async.html),

看一个异步加载到的 demo , Lazy.vue 组件内部有一个异步的 pdf 预览组件.
```ts
// Lazy.vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 简单用法
const AsyncPdf = defineAsyncComponent({
  loader: () => import('./AsyncPdf.vue'),
  delay: 200,
})
</script>

<template>
  <h4 style="color: red">测试 async</h4>
  <br />
  <AsyncPdf></AsyncPdf>
</template>


```

```ts
// AsyncPdf.vue
<script setup lang="ts">
</script>

<template>
  <div>
    <div>pdf file</div>
    <div v-if="false" data-testid="if">if button</div>
    <div v-show="false" data-testid="show">show button</div>
  </div>
</template>


```
我们只需要测试，1秒之后，页面出现 pdf

```ts
import { mount } from '@vue/test-utils'
import Lazy from './Lazy.vue'

describe('Lazy', () => {
  it('renders Lazy component', async () => {
    const wrapper = mount(Lazy)
    expect(wrapper.text()).not.toContain('pdf')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    expect(wrapper.text()).toContain('pdf')
  })
})

```
## 课件地址

上面的代码，都放到了 [github](https://github.com/Faithree/vue-test-book) 上，欢迎点赞收藏，我会持续更新代码和文章，消息窗口我，或者直接加我 wechat: match124


