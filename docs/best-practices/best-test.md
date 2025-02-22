
# 测试理念

在编写单元测试时，我们应该遵循 FIRST 原则，这是一组经典的单元测试指导原则，它包含以下五个核心要点：

- **Fast（快速）**：测试应该运行得快。测试运行速度越快，开发者就越愿意经常运行它们。
- **Independent（独立）**：测试之间应该相互独立，一个测试不应依赖于其他测试的运行结果。
- **Repeatable（可重复）**：测试应该在任何环境中都能产生相同的结果。
- **Self-validating（自验证）**：测试应该能够自动判断是通过还是失败，无需人工判断。
- **Timely（及时）**：测试应该及时编写，最好在编写生产代码之前就完成测试代码的编写（测试驱动开发）。

```ts
// ❌ 违反 FIRST 原则的示例
describe('UserService', () => {
  let user: User

  it('should create user', async () => { // 违反 Independent 原则
    user = await createUser('test')
    expect(user.name).toBe('test')
  })

  it('should update user', async () => { // 依赖前一个测试的结果
    const updated = await updateUser(user.id, { age: 20 })
    expect(updated.age).toBe(20)
  })

  it('should be slow', async () => { // 违反 Fast 原则
    await sleep(2000) // 不必要的等待
    const result = await someOperation()
    expect(result).toBeTruthy()
  })
})

// ✅ 遵循 FIRST 原则的示例
describe('UserService', () => {
  it('should create user', async () => {
    const user = await createUser('test')
    expect(user.name).toBe('test')
  })

  it('should update user', async () => {
    const user = await createUser('test') // 独立创建测试数据
    const updated = await updateUser(user.id, { age: 20 })
    expect(updated.age).toBe(20)
  })

  it('should handle operation efficiently', async () => {
    vi.useFakeTimers() // 使用虚拟定时器加速测试
    const promise = someOperation()
    vi.runAllTimers()
    const result = await promise
    expect(result).toBeTruthy()
  })
})
```

除了 FIRST 原则外，以下是一些具体的最佳实践原则：

## 1. 保持测试独立

每个测试用例应该是完全独立的，不依赖于其他测试的执行结果或状态。这意味着：

- 测试之间不应该共享可变状态
- 每个测试都应该设置自己的测试环境
- 测试执行顺序不应该影响测试结果

```ts
// ❌ 错误示例：测试之间共享状态
let counter = 0

describe('Counter', () => {
  it('should increment', () => {
    counter++
    expect(counter).toBe(1)
  })

  it('should increment again', () => {
    counter++
    expect(counter).toBe(2) // 依赖于前一个测试的状态
  })
})

// ✅ 正确示例：每个测试都是独立的
describe('Counter', () => {
  let counter: number

  beforeEach(() => {
    counter = 0 // 每个测试前重置状态
  })

  it('should increment', () => {
    counter++
    expect(counter).toBe(1)
  })

  it('should increment again', () => {
    counter++
    expect(counter).toBe(1)
  })
})
```

## 2. 使用描述性的测试名称

测试名称应该清晰地描述被测试的行为和预期结果。好的测试名称应该：

- 描述被测试的功能或场景
- 说明预期的输出或行为
- 使用一致的命名约定

```ts
// ❌ 错误示例：不清晰的测试名称
describe('login', () => {
  it('test1', () => {
    // 测试代码
  })
})

// ✅ 正确示例：描述性的测试名称
describe('LoginComponent', () => {
  it('should show error message when password is invalid', () => {
    // 测试代码
  })

  it('should redirect to dashboard after successful login', () => {
    // 测试代码
  })
})
```

## 3. 避免测试实现细节

测试应该关注组件或函数的公共接口和行为，而不是内部实现细节。这样可以：

- 使测试更加稳定，不会因实现变化而失败
- 提高测试的可维护性
- 关注真正重要的功能行为

```ts
// ❌ 错误示例：测试实现细节
it('should call private method _calculateTotal', () => {
  const cart = new ShoppingCart()
  const spy = vi.spyOn(cart as any, '_calculateTotal')
  cart.addItem({ price: 100 })
  expect(spy).toHaveBeenCalled()
})

// ✅ 正确示例：测试公共行为
it('should update total price when adding item', () => {
  const cart = new ShoppingCart()
  cart.addItem({ price: 100 })
  expect(cart.getTotal()).toBe(100)
})
```

## 4. 使用 beforeEach/afterEach 进行测试准备

使用生命周期钩子来设置和清理测试环境，这样可以：

- 避免代码重复
- 确保每个测试都有一个干净的环境
- 提高代码的可维护性

```ts
describe('UserService', () => {
  let userService: UserService
  let mockHttp: MockHttpClient

  beforeEach(() => {
    mockHttp = new MockHttpClient()
    userService = new UserService(mockHttp)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch user data', async () => {
    // 测试代码
  })

  it('should update user profile', async () => {
    // 测试代码
  })
})
```

## 5. 保持测试简单和可读

测试代码应该简单直观，易于理解和维护。可以通过以下方式实现：

- 使用有意义的变量名
- 提取重复的测试设置代码
- 避免过度复杂的测试场景

```ts
// ❌ 错误示例：复杂难懂的测试
it('test', async () => {
  const x = new Comp()
  x.data = getData()
  await x.init()
  const y = x.process()
  expect(y.z).toBe(true)
})

// ✅ 正确示例：清晰可读的测试
it('should process data successfully when initialized with valid data', async () => {
  const component = new DataProcessor()
  const testData = createTestData()
  component.setData(testData)
  
  await component.initialize()
  const result = component.process()
  
  expect(result.isValid).toBe(true)
})
```

## 6. 测试边界条件

确保测试覆盖各种边界情况和异常场景：

- 空值和无效输入
- 最大/最小值
- 错误条件和异常处理

```ts
describe('divide function', () => {
  it('should divide two positive numbers', () => {
    expect(divide(10, 2)).toBe(5)
  })

  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero')
  })

  it('should handle decimal numbers', () => {
    expect(divide(5.5, 2)).toBe(2.75)
  })

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5)
  })
})
```

## 7. 使用适当的断言

选择合适的断言方法来验证测试结果：

- 使用最具体的断言
- 避免过度断言
- 确保断言信息清晰

```ts
// ❌ 错误示例：过度断言
it('should create user', () => {
  const user = new User('John')
  expect(user).toEqual({
    id: expect.any(Number),
    name: 'John',
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    lastLoginTime: null,
    // ... 更多不必要的属性
  })
})

// ✅ 正确示例：恰当的断言
it('should create user with correct name', () => {
  const user = new User('John')
  expect(user.name).toBe('John')
})

it('should generate unique id for new user', () => {
  const user = new User('John')
  expect(user.id).toBeTruthy()
})
```

## 8. 保持测试快速运行

测试执行速度对开发效率有重要影响：

- 避免不必要的异步操作
- 使用适当的 mock
- 优化测试设置和清理

```ts
// ❌ 错误示例：低效的测试
it('should process items', async () => {
  await sleep(1000) // 不必要的等待
  const result = await processItems()
  expect(result).toBeTruthy()
})

// ✅ 正确示例：高效的测试
it('should process items', async () => {
  vi.useFakeTimers() // 使用虚拟定时器
  const promise = processItems()
  vi.runAllTimers()
  const result = await promise
  expect(result).toBeTruthy()
})
```

## 总结

遵循这些最佳实践可以帮助我们编写出更好的测试代码。记住：

- 测试应该可靠且独立
- 测试代码也是代码，需要保持整洁和可维护
- 关注测试的价值而不是覆盖率数字
- 持续改进测试实践和流程

好的测试不仅能够保证代码质量，还能作为代码的文档，帮助其他开发者理解代码的行为和意图。
