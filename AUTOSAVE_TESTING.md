# 自动保存功能测试指南

## 如何查看自动保存日志

现在控制台会显示详细的自动保存日志，包括：

### 🔍 控制台日志说明

#### 1. 系统初始化日志
```
🚀 Auto-save system activated! { eventId: "xxx", hasContent: true }
🎯 Initializing auto-save with first version...
```

#### 2. 内容变化检测日志
```
📝 Content changed detected, adding new version and scheduling save...
⏱️ Setting debounced save timer (2 seconds)...
🔄 Content changed, triggering debounced save
```

#### 3. 定期保存日志
```
🔄 Starting periodic save (every 10 seconds)...
⏰ Periodic save check...
🔄 Content changed, triggering periodic save
```

#### 4. API请求日志
```
🌐 Sending API request: { url: "...", eventId: "...", contentLength: 1234 }
📡 API response received: { status: 200, statusText: "OK", ok: true }
✅ API response content: ✅ success
```

#### 5. 保存状态日志
```
💾 Starting auto-save...
✅ Auto-save successful: 2024-01-01 12:00:00
```

### 🧪 测试步骤

1. **打开浏览器开发者工具**
   - 按 F12 或右键选择"检查"
   - 切换到 Console 标签

2. **生成会议记录**
   - 输入会议URL并点击"Generate Notes"
   - 观察控制台是否显示初始化日志

3. **测试自动保存**
   - 在编辑器中输入一些文字
   - 观察控制台是否显示内容变化检测
   - 等待2秒，观察是否触发防抖保存
   - 等待10秒，观察是否触发定期保存

4. **测试手动保存**
   - 按 Ctrl+S 或点击保存按钮
   - 观察控制台是否显示手动保存日志

5. **测试版本历史**
   - 点击📚按钮查看版本历史
   - 测试撤销/重做功能

### 🔧 调试面板

在开发模式下，左上角会显示调试面板，包含：
- 保存状态信息
- 版本历史统计
- 操作按钮
- 错误信息（如果有）

### 🚨 常见问题排查

#### 问题1: 没有看到自动保存日志
**可能原因:**
- 没有会议数据或eventId
- 编辑器内容为空
- 网络连接问题

**解决方案:**
- 确保已生成会议记录
- 检查控制台是否有错误信息
- 查看调试面板的状态信息

#### 问题2: 保存失败
**可能原因:**
- API服务器未启动
- 网络连接问题
- 后端接口错误

**解决方案:**
- 检查API URL是否正确
- 查看网络请求是否成功
- 检查后端服务状态

#### 问题3: 版本历史不工作
**可能原因:**
- 内容没有变化
- 版本数量达到上限

**解决方案:**
- 确保编辑了内容
- 查看版本历史面板

### 📊 日志级别说明

- 🚀 系统启动
- 📝 内容变化
- ⏱️ 定时器设置
- 🔄 保存触发
- 💾 保存开始
- ✅ 保存成功
- ❌ 保存失败
- 🌐 API请求
- 📡 API响应

### 🎯 预期行为

正常情况下，你应该看到：
1. 系统启动时的激活日志
2. 编辑内容时的变化检测日志
3. 2秒后的防抖保存日志
4. 10秒后的定期保存日志
5. API请求和响应的详细日志
6. 保存成功的确认日志

如果任何步骤没有出现预期日志，请检查控制台是否有错误信息。
