# 5. 浏览器测试

## 配置浏览器环境

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom' // 或 'jsdom'
  }
})
```
