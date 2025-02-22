日常开发，我们脱离不了事件，当我们遇到元素的 click, check 等事件的时候，是怎么测试的呢？

## 普通事件
在 vue 测试中，核心的 api 是  wrapper 提供的 trigger 方法来触发。
例如，我们来一个最简单的单击 click 事件，点击之后，展示字符 vitest

```ts
<script setup lang="ts">
import { ref } from 'vue'
const show = ref(false)

const onClick = () => {
  show.value = true
}
</script>

<template>
  <div>
    <div v-if="show">vitest</div>
    <div @click="onClick" data-testid="button">按钮</div>
  </div>
</template>

```
```ts
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('click button', () => {
  it('mount', async () => {
    const wrapper = mount(Button)
    const button = wrapper.find('[data-testid="button"]')
    expect(wrapper.text()).not.toContain('vitest')
    await button.trigger('click')
    expect(wrapper.text()).toContain('vitest')
  })
})

```

> 这里要注意的是，trigger 是一个异步函数，需要使用 await 语法，否则 trigger 立即断言，会不成功

### 鼠标双击事件
如果会了单击，双击就是 trigger 换个参数
例如 
```ts
<div @dblclick="onClick" data-testid="button">按钮</div>
```
```ts
await button.trigger('dbclick')
```
### 鼠标右键
click.right
```ts
<div @click.right="onClick" data-testid="button">按钮</div>
```
```ts
await button.trigger('click.right')
```
反正 vue 事件是什么，测试事件就是什么，具体可以通过代码编辑器的提示，或者文档
![image.png](/7.1.jpg)

### 键盘事件



![image.png](/7.2.jpg)


如果想更加具体的判断键盘的按钮，需要使用 trigger 的第二个参数

因为官方文档并没有清晰列出所有的事件，下面是 trigger 的类型定义

```ts
trigger(eventString: DomEventNameWithModifier, options?: TriggerOptions): Promise<void>;


export type DomEventNameWithModifier = DomEventName | `${DomEventName}.${(typeof systemKeyModifiers)[number]}` | `click.${(typeof mouseKeyModifiers)[number]}` | `click.${(typeof systemKeyModifiers)[number]}.${(typeof mouseKeyModifiers)[number]}` | `${'keydown' | 'keyup'}.${keyof typeof keyCodesByKeyName}` | `${'keydown' | 'keyup'}.${(typeof systemKeyModifiers)[number]}.${keyof typeof keyCodesByKeyName}`;

interface TriggerOptions {
    code?: String;
    key?: String;
    keyCode?: Number;
    [custom: string]: any;
}

```

更多 vue 事件可以查看 [event-handling](https://cn.vuejs.org/guide/essentials/event-handling.html)
## 表单的输入事件
通过上面的学习，可能你会认为，表单事件就是 checked 事件，input 事件，select 事件，submit 事件。这样确实可以，但不方便。


但我们在使用表单的时候，并不是想知道事件何时触发，而是直接使用 v-model 去绑定值，那如何测试，不可能每一次都手动用事件去监听表单数据被修改。那如何断言表单填充的数据是否有问题呢，我们可以直接使用 setValue 给表单赋值，然后断言填充的值是否正确

```ts
<script setup lang="ts">
import { ref } from 'vue'
const name = ref('')
const isMan = ref(1)
const country = ref(['jpy'])


</script>

<template>
  <div>
    <input v-model="name" data-testid="input"/>
    <div>{{ name }}</div>
    <h2>radio</h2>
    <input type="radio" v-model="isMan" data-testid="radio-1" value="1"/>
    <input type="radio" v-model="isMan" data-testid="radio-2" value="2"/>
    <div>{{ isMan }}</div>
    <h2>select</h2>
    <select name="country" data-testid="select-country" v-model="country" >
      <option value="cn" label="cn"></option>
      <option value="jpy" label="jpy"></option>
      <option value="uk" label="uk"></option>
    </select>
    <div>
      {{ country }}
    </div>
  </div>
</template>

```

### input 输入事件
```ts
  it('mount', async () => {
    const wrapper = mount(Form)
    const input = wrapper.find('[data-testid="input"]')
    await input.setValue('123');
    expect(wrapper.text()).toContain('123')
  })
```

### checkbox/radio 选择事件

```ts
  it('radio', async () => {
    const wrapper = mount(Form)
    expect(wrapper.text()).toContain('1')
    const input = wrapper.find('[data-testid="radio-2"]')
    await input.setValue(true)
    expect(wrapper.text()).toContain('2')
  })
```
### select 列表选择事件
```ts
 it('select', async () => {
    const wrapper = mount(Form)
    const select = wrapper.find('[data-testid="select-country"]')
    expect(wrapper.text()).toContain('jpy')
    await select.setValue(['uk'])
    expect(wrapper.text()).toContain('uk')
  })
```


## 手动触发 emit 事件
在 vue 组件中，父子通信也是通过事件。文档中是通过 [emit](https://cn.vuejs.org/guide/essentials/component-basics.html#listening-to-events) 去使用。

有两种方式触发 emit

1. 通过 trigger 绑定的事件方法里面去调用 emit
2. 通过组件的 `vm.$emit(method,value)`

Parent.vue
```ts
<script setup lang="ts">
import { ref } from 'vue'
import Button from './Button.vue'
const str = ref('')
const onClick = (value) => {
  str.value = value
}
</script>

<template>
  <div>
    <div>{{ str }}</div>
    <Button @handle-click="onClick"></Button>
  </div>
</template>

```
Button.vue
```ts
<script setup lang="ts">
import { ref } from 'vue'
const show = ref(false)
const emit = defineEmits(['handleClick'])

const onClick = () => {
  show.value = true
  emit('handleClick', 'customEmit')
}
</script>

<template>
  <div>
    <div v-if="show">vitest</div>
    <div @click="onClick" data-testid="button">按钮</div>
  </div>
</template>

```
```ts
import { mount } from '@vue/test-utils'
import Parent from './Parent.vue'
import Button from './Button.vue'

describe('手动触发子组件 button emit事件', () => {
  it('通过 trigger 绑定的事件方法里面去调用 emit', async () => {
    const wrapper = mount(Parent)
    const button = wrapper.find('[data-testid="button"]')
    expect(wrapper.text()).not.toContain('customEmit')
    await button.trigger('click')
    expect(wrapper.text()).toContain('customEmit')
  })

  it('通过组件的 `vm.$emit(method,value)`', async () => {
    const wrapper = mount(Parent)
    const button = wrapper.getComponent(Button)
    expect(wrapper.text()).not.toContain('customEmit')

    await button.vm.$emit('handleClick', 'customEmit') // 手动触发子组件 emit 事件
    console.log(wrapper.html())
    expect(wrapper.text()).toContain('customEmit')
  })
})


```
子组件向上传递的 customEmit 正确显示出来了

![image.png](/7.3.jpg)
## 课件地址

上面的代码，都放到了 [github](https://github.com/Faithree/vue-test-book) 上，欢迎点赞收藏，我会持续更新代码和文章，消息窗口我，或者直接加我 wechat: match124
