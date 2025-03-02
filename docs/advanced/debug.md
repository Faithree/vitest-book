很多新手刚开始学单元测试，就是因为不懂得如何断点或者调试，导致写的测试用例经常报错，然后放弃了，包括我刚学那会也放弃过。说实话，我应该早点写这一篇文章，拯救大家于水深火热中，这一章会是我这个系列文章里面含金量最高的一篇.

这一节，我们来讲讲如何在写单元测试时，遇到不符合自己预期，但又不知道哪里出问题时，如何快速定位以及改正。


先回顾一下，第一节课我们就讲了在`vitest.config.ts`文件配置了日志`reporters`可以输出到 html、控制台上，
```ts
// vitest.config.ts
reporters: ['verbose', 'html', 'json'],
```

对于一些简单的对比，例如公式计算的 `toBe` 判断，控制台会有 `Expect` 和 `Received` 去给我们参考，这样我们就大概能定位到出什么问题了。


![image.png](/14.1.jpg)



对于另一种情况，稍微复杂一点，或者组件内部出错，日志就不一定会有 `Expect` 和 `Received`，如下 `wrapper.html()`，语法就直接报错，并没有提示哪里出了问题。
![image.png](/14.2.jpg)




如果能断点看看，到底输出什么，就更加方便修正测试用例了，那么我们如何在调试的时候打断点呢，接下来我讲几种方法，大家都可以尝试

## 1.vscode vitest 插件

最简单的是安装一个 vscode vitest 插件

![image.png](/14.3.webp)


然后打开 test 文件之后，打上红色的断点🔴之后，右键调试测试就行了
![image.png](/14.4.jpg)

![image.png](/14.5.jpg)


对于简单的报错，还是能捕获的，甚至区分左右两栏的输出在界面上，看起来挺不错。

![image.png](/14.6.jpg)


但如果这个组件本身报错，或者其他地方报错，插件就不友好了
，例如当 find 一个不存在的节点，插件就无法判断出是什么错误了，还是有很大局限的
![image.png](/14.7.jpg)





接下来会讲使用 vscode 控制台调试，它就会有标明具体的错误和行数，例如下图
![image.png](/14.8.jpg)

## 2.vscode 控制台调试终端
接下来看看控制台调试

点击 Javascript 调试终端按钮，会在 vscode 新增一个调试命令行
![image.png](/14.9.jpg)




然后执行 `pnpm vitest src/components/5/Find.test.ts`


![image.png](/14.10.webp)



然后断点就会被定住
![image.png](/14.11.jpg)


然后就能看到比较清晰的错误
![image.png](/14.12.jpg)



## 3.自己写配置
还有一种是自己写一个 vscode 启动配置的方式去 debug，这方案类似 vitest vscode 插件的实现原理，但也有局限，我先不讲，后续等 vscode 修复了局限，我再重新开一章节，讲解如何实现 vitest 插件的实现原理。
```json
{
  // 使用 IntelliSense 了解相关属性。 
  // 悬停以查看现有属性的描述。
  // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
   {
    "name": "Launch Program",
    "request": "launch",
    "type": "node",
    "console": "integratedTerminal",
    "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
    "args": ["${file}"]，
      // "args": [
      //   "${file}",
      //   "--pool",
      //   "forks",
      //   "--poolOptions.forks.singleFork",
      // ],
   }
  ]
}
```

## 4.最终方案及案例

回看第 10 课的 mock store 的例子
```ts
import { mount } from '@vue/test-utils'
import StoreApp from './StoreApp.vue'
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
    const wrapper = mount(StoreApp)
    console.log('wrapper.html()', wrapper.html())
    expect(wrapper.html()).toContain(0)
    await wrapper.find('[data-testid="account-button"]').trigger('click')
    expect(commit).toHaveBeenCalled()
    expect(commit).toHaveBeenCalledWith('increment')
  })
})

```



在调用 `mount（App）`的时候，不但可以在 test 文件去输出日志，还可以在组件上打印。
一般情况下我们编写测试用例是不需要 debug 组件的，但是我们对于编写测试用例不熟的话，就可能需要在组件上输出日志，因为在组件里面 debug 比较难，我们可以通过 console 打上日志。
例如，我 mock 了 store，但我不确定我 mock 函数是否生效了，那么可以在 Mock.vue 里面调用 `useStore`的时候，`console.log` 或者 `debugger`



![image.png](/14.13.webp)


这时候我们运行`vitest --ui`（如果不知道干嘛的，可以看前面几章节）就可以看到，在组件中的 useStore 输出的是一个 mock 函数，是假的，但组件内的 debugger 会被忽略。
![image.png](/14.14.jpg)


如果我想在组件内 debugger 呢？那我们只能使用上面说的控制台调试终端了

1. 成功在 test 文件 debugger
![image.png](/14.15.webp)


2. 成功在 vue 文件 debugger
![image.png](/14.16.webp)


看起来不管是 test 测试文件，还是组件 debugger 正常，很舒服

> 但这种调试方式, 在遇到组件有 `style`标签的时候，只能用 console.log, 并不能直接在组件内使用debugger，组件内的断点可能会失效或者断点定位不准


![image.png](/14.17.jpg)


![image.png](/14.18.webp)


debugger 失效了，这种办法不行了，那如何解决呢, 需要使用另一种方法。

```ts
    "vitest:debug": "vitest ./src/components/10/mock.vuex.test.ts --inspect-brk --pool forks --poolOptions.forks.singleFork ",
```
加上之后，运行 `pnpm vitest:debug`,打开谷歌浏览器，在地址栏输入`chrome://inspect`, 然后点击  inspect 按钮，就会出现调试页面

![image.png](/14.19.jpg)






要等一下，等测试用例跑完之后，这时候组件 debugger  被正确断点，即使组件内有 style 标签

![image.png](/14.20.jpg)


## 5. 推荐指数
1. vscode vitest 插件适合新手，适合学习开源 vitest 项目或者维护老项目
2. 控制台调试终端适合新增单元测试，具体定位某一个文件
3. 最终方案配置起来略微复杂，如果方法 2 断点不了，再使用最终方案

## 6. 额外扩展学习

https://www.vitest-preview.com/zh/

## 课件地址

上面的代码，都放到了 [github](https://github.com/Faithree/vue-test-book) 上，创作不易，免费的同时希望大家点赞收藏给我动力，我会持续更新代码和文章，消息窗口我，或者直接加我 wechat: match124
