我们知道，lodash 是一个非常完善的 js 工具库，它的测试用例也十分完善，但这个库是 jest 和 chai 编写的，我使用 vitest 带着大家过一遍部分源码，从中学习和加强自己前面所学的知识，增强编写单元测试能力。

我们安装一个 lodash 
```bash
pnpm i lodash-es

pnpm i @types/lodash-es -D
```

## 简单
### [capitalize](https://www.lodashjs.com/docs/lodash.capitalize)
转换字符串`string`首字母为大写，剩下为小写。 
大概就三种情况
1. 小写的转大写
2. 大写的不需要处理
3. 空格等其他字符不处理


```ts
describe('capitalize', () => {
  it('should capitalize the first character of a string', () => {
    expect(capitalize('fred')).toBe('Fred')
    expect(capitalize('Fred')).toBe('Fred')
    expect(capitalize(' fred')).toBe(' fred')
    expect(capitalize('*fred')).toBe('*fred')
    expect(capitalize('//fred')).toBe('//fred')
  })
})

```
最后，这些 `expect` 函数调用进行了以下检查：

  


-   `expect(capitalize('fred')).toBe('Fred')`: `capitalize` 应该把 'fred' 的首字母大写，得到 'Fred'。
-   `expect(capitalize('Fred')).toBe('Fred')`: 即便 'Fred' 已经有首字母大写，`capitalize` 也应该返回 'Fred'，不作改变。
-   `expect(capitalize(' fred')).toBe(' fred')`: 如果字符串以空格开头，`capitalize` 不会更改空格后面的首字母。
-   `expect(capitalize('*fred')).toBe('*fred')`: 如果字符串以非字母字符开头，`capitalize` 不会更改这个字符后的首字母。
-   `expect(capitalize('//fred')).toBe('//fred')`: 同上，`capitalize` 对于以多个非字母字符开头的字符串也保持这个行为。

### [flattenDeep](https://www.lodashjs.com/docs/lodash.flattenDeep)

将`array`递归为一维数组。
我们来设想如果有个方法能把数组变成一维，大概会这样
1. 一维数组不变
2. 二维数据变一维数组
3. 多维数组变一维数组

```ts

import { flattenDeep } from 'lodash-es'

describe('flatten methods', () => {
  it('二维数组', () => {
    const array = [1, 2, 3, [1, 2, 3]]
    expect(flattenDeep(array)).toEqual([1, 2, 3, 1, 2, 3])
  })

  
  it('多维度数组', () => {
    const array = [1, [2, [3, [4]], 5]]
    expect(flattenDeep(array)).toEqual([1, 2, 3, 4, 5])
  })

  
  it('多维空数组', () => {
    const array = [[], [[]], [[], [[[]]]]]
    expect(flattenDeep(array)).toEqual([])
  })
})

```

那么我们写完之后，可能对自己单元测试不够放心，会不会漏了哪几种情况？如果漏了也不需要担心，等测试人员人工测试等时候，如果他发现了 bug ，那你再来补上单元测试就行，因为不可能真的能考虑周全，我们只是前端，不是测试。但好在我们是在测试 lodash ,它本身就有很完善的测试文件，我们可以对比他的单元测试和我们写的区别，最后少了一条,那我们就学到了，以后写函数，就要对类型做兼容或者限制

```ts

  it('其他类型', () => {
    const expected: [] = []
    const nonArray: any = { 0: 'a' }
    expect(flattenDeep(nonArray)).toEqual(expected)
  })
```


## 中等

### [clone](https://www.lodashjs.com/docs/lodash.clone)

clone 方法，就是必须兼容各种各样 js 数据结构
它的核心方法就 3 个
1. 浅复制的时候，第二层的对象地址还是原来的对象地址
```ts
  it('clone 浅复制', () => {
    const array = [{ a: 0 }, { b: 1 }]
    const actual = clone(array)

    expect(actual).toStrictEqual(array)
    expect(actual !== array && actual[0] === array[0])
  })
```

2. 深复制的时候，第二层的对象地址不等于新复制的对象地址
```ts
  it('cloneDeep 深复制', () => {
    const array = [{ a: 0 }, { b: 1 }];
    const actual = cloneDeep(array);

    expect(actual).toEqual(array);
    expect(actual !== array && actual[0] !== array[0])
});
```
3. 深复制可以复制回环对象
```ts
  it('cloneDeep 可以复制一个回环的对象', () => {
    const object = {
      foo: { b: { c: { d: {} } } },
      bar: {}
    }

    object.foo.b.c.d = object
    object.bar.b = object.foo.b

    const actual = cloneDeep(object)
    expect(actual.bar.b === actual.foo.b && actual === actual.foo.b.c.d && actual !== object).toBe(
      true
    )
  })
```

### uniq
去重、lodash 去重有很多种方式.` ['uniq', 'uniqBy', 'uniqWith', 'sortedUniq', 'sortedUniqBy']`,用了个很巧妙的方式，在一个测试文件里面测了这么多种方法，通过循环，只写一遍 it 语句，就动态生成 3 条用例
```ts
  _.each(['uniq', 'uniqBy', 'uniqWith', 'sortedUniq', 'sortedUniqBy'], (methodName) => {
    const func = _[methodName]
    const isSorted = /^sorted/.test(methodName)
    let objects = [{ a: 2 }, { a: 3 }, { a: 1 }, { a: 2 }, { a: 3 }, { a: 1 }]
    if (isSorted) {
      objects = sortBy(objects, 'a')
    } else {
      it(`\`_.${methodName}\` 去重未排序的数组`, () => {
        const array = [2, 1, 2]
        expect(func(array)).toEqual([2, 1])
      })
    }
  })
```

![image.png](/15.1.jpg)

剩下的就是一些兼容处理、边界判断，比如处理 NaN，处理对象
```ts
    it(`\`_.${methodName}\` 可以处理 \`NaN\``, () => {
      expect(func([NaN, NaN])).toEqual([NaN])
    })
    it(`\`_.${methodName}\` 可以处理 object 类型的数据`, () => {
      expect(func(objects)).toEqual(objects)
    })
```
其实在写测试用例的时候，是可以适当使用一些本身 lodash 自带的工具方法的，例如 `each、times`去做数据的准备处理。例如下面的用例，通过`each、times` 创建了大量的重复数据提供测试.
```ts
    it(`\`_.${methodName}\` 处理容量很大的数组`, () => {
      const largeArray: any = []
      const expected = [0, {}, 'a']
      const count = Math.ceil(LARGE_ARRAY_SIZE / expected.length)

      _.each(expected, (value) => {
        _.times(count, () => {
          largeArray.push(value)
        })
      })
      expect(func(largeArray)).toEqual(expected)
    })
```


## 困难

### [ debounce](https://www.lodashjs.com/docs/lodash.debounce#_debouncefunc-wait0-options)
1. 函数是否能延迟测试


```ts
  it('测试延迟', () => {
    let callCount = 0

    const debounced = debounce((value) => {
      ++callCount
      return value
    }, 32)

    const results = [debounced('a')]
    expect(results).toEqual([undefined])
    expect(callCount).toBe(0)

    setTimeout(() => {
      expect(callCount).toBe(1)
    }, 32)
  })
```
2. 多次触发函数，是否只会执行最后一次。

下面例子，debounced 被间隔的执行了 4 次，但最后的 callCount 等于 1 ，说明只执行了一次，且等于返回值是第三次 `debounced('c')` 的返回值 `c`
```ts
  it('多次触发 debounced 函数，', () => {
    let callCount = 0

    const debounced = debounce((value) => {
      ++callCount
      return value
    }, 64)
    debounced('a')
    expect(callCount).toBe(0)
    setTimeout(() => {
      expect(debounced('b')).toBe(undefined)
      expect(callCount).toBe(0)
    }, 32)

    setTimeout(() => {
      expect(debounced('c')).toBe(undefined)
      expect(callCount).toBe(0)
    }, 64)

    setTimeout(() => {
      expect(debounced('d')).toBe('c')
      expect(callCount).toBe(1)
    }, 128)
  })
```
3. 即使等待时间是 0 的时候，不应该立即执行
```ts
  it('即使等待时间是 0 的时候，不应该立即执行', () => {
    let callCount = 0
    const debounced = debounce(() => {
      ++callCount
    }, 0)

    debounced()
    debounced()
    expect(callCount).toBe(0)

    setTimeout(() => {
      expect(callCount).toBe(1)
    }, 5)
  })
```
4. 第三个参数传递空对象，会走磨人的配置
 ```ts
   it('第三个参数是空对象也能运行', () => {
    let callCount = 0
    const debounced = debounce(
      () => {
        callCount++
      },
      32,
      {}
    )
    debounced()
    expect(callCount).toBe(0)

    setTimeout(() => {
      expect(callCount).toBe(1)
    }, 64)
  })
 ```
6. 支持其他的参数配置，例如 `leading` ，`leading`参数就是会立即执行一次，不需要先等待一定时间之后再执行。
```ts
  it('支持 leading 参数', () => {
    const callCounts = [0, 0]

    const withLeading = debounce(
      () => {
        callCounts[0]++
      },
      32,
      { leading: true }
    )

    const withLeadingAndTrailing = debounce(
      () => {
        callCounts[1]++
      },
      32,
      { leading: true }
    )
    withLeading()
    expect(callCounts[0]).toBe(1)
    withLeadingAndTrailing()
    withLeadingAndTrailing()
    expect(callCounts[1]).toBe(1)

    setTimeout(() => {
      expect(callCounts).toEqual([1, 2])
      withLeading()
      expect(callCounts[0]).toBe(2)
    }, 64)
  })
```
核心的用例就这几个，剩下的都是传递不同的参数，然后运行你会发现，debounce 难就难在，用例多，但每一个用例，其实就是测试具体某一个空场景，或者某个不同的参数，针对不同的表现做的测试用例。

我们会发现我搬过来的源码，loadash 并没有使用 fakeTime 去快进我们的时候，所以，这也是可以优化的部分

## 工具函数
在 lodash 测试源码`utils.js`里面，有一些工具函数是值得借鉴学习的

提前把一些常用类型、全局属性定义好
```ts
/** Used for native method references. */
const arrayProto = Array.prototype;
const funcProto = Function.prototype;
const objectProto = Object.prototype;
const numberProto = Number.prototype;
const stringProto = String.prototype;

// 常用类型
const ArrayBuffer = root.ArrayBuffer;
const Buffer = root.Buffer;
const Map = root.Map;
const Promise = root.Promise;
const Proxy = root.Proxy;
const Set = root.Set;
const Symbol = root.Symbol;
const Uint8Array = root.Uint8Array;
const WeakMap = root.WeakMap;
const WeakSet = root.WeakSet;

/** `Object#toString` result references. */
const funcTag = '[object Function]';
const numberTag = '[object Number]';
const objectTag = '[object Object]';

```
常用 stub，stub 我们在前面讲过
```ts

const stubTrue = function () {
    return true;
};
const stubFalse = function () {
    return false;
};

const stubNaN = function () {
    return NaN;
};
const stubNull = function () {
    return null;
};
const stubArray = function () {
    return [];
};
const stubObject = function () {
    return {};
};
const stubString = function () {
    return '';
};

```
常用方法，例如是否空对象、设置属性
```ts
function emptyObject(object) {
    lodashStable.forOwn(object, (value, key, object) => {
        delete object[key];
    });
}

function setProperty(object, key, value) {
    try {
        defineProperty(object, key, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: value,
        });
    } catch (e) {
        object[key] = value;
    }
    return object;
}
```
总结
1. 我们可能无法一开始就考虑的十分周全，但我们可以慢慢在后续不断完善用例
2. 我们可以从如下几个方面去测试纯函数的单元测试
3. 核心功能一定要写完善的单元测试，比如`uniq`，核心就是数组去重
4. 边界判断考虑全，例如空值、还是空对象，或者是默认参数
5. 函数的每一个参数都要有一个用例去覆盖

