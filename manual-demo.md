# DiffAgent Web 界面操作演示

## 演示步骤

### 步骤 1: 访问 Web 界面
- 打开浏览器
- 访问地址: `http://10.0.0.5:3000`
- 页面显示 "DiffAgent - Code Analysis Platform"

### 步骤 2: 输入 Git Diff
在左侧文本框中输入以下示例代码:

```diff
diff --git a/example.ts b/example.ts
index 1234567..89abcdef 100644
--- a/example.ts
+++ b/example.ts
@@ -1,3 +1,5 @@
+// Unsafe TypeScript code with security issues
+const userData: any = getUserInput();
+const password = "hardcoded_password_123";
 function processUser(user) {
-  console.log("Processing user");
+  console.log(`Processing user: ${user.name}`);
 }
```

### 步骤 3: 点击分析按钮
- 点击 "Analyze Code" 按钮
- 或按 Ctrl+Enter 快捷键

### 步骤 4: 查看分析结果
右侧会显示分析结果，包括:

**总体风险评估:**
- 风险等级: HIGH
- 风险分数: 0.85
- 分析文件数: 1

**安全问题检测:**
1. **显式 any 类型检测** (严重程度: HIGH)
   - 建议: 替换为具体的接口或 unknown 类型
   
2. **硬编码凭据检测** (严重程度: HIGH)  
   - 建议: 将密钥移至环境变量

3. **类型安全问题** (严重程度: MEDIUM)
   - 建议: 添加适当的类型注解

### 步骤 5: 结果持久化
- 所有分析结果自动存储到数据库
- 可以通过 API 查询历史分析记录

## 功能特性

✅ **实时分析**: 即时代码安全性和质量分析  
✅ **多语言支持**: TypeScript, Go, JavaScript, Python 等  
✅ **智能推荐**: ML 增强的建议系统  
✅ **数据持久化**: 自动存储分析历史  
✅ **响应式设计**: 支持桌面和移动设备  

## API 集成

除了 Web 界面，还可以通过 API 使用:

```bash
curl -X POST http://10.0.0.5:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"diff": "your-git-diff-content"}'
```

## 访问地址
- **Web 界面**: http://10.0.0.5:3000
- **API 端点**: http://10.0.0.5:3000/api/analyze
- **健康检查**: http://10.0.0.5:3000/health