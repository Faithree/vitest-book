# 8. Pinia 测试

## 测试 Pinia Store

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from './stores/counter'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Pinia 测试', () => {
  it('应该更新 count', () => {
    const counter = useCounterStore()
    counter.increment()
    expect(counter.count).toBe(1)
  })
})
```
