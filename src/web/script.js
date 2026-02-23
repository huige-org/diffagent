class DiffAgentWeb {
  constructor() {
    this.apiUrl = '/api/analyze';
    this.initElements();
    this.bindEvents();
    this.loadSampleDiffs();
  }

  initElements() {
    this.diffInput = document.getElementById('diffInput');
    this.analyzeBtn = document.getElementById('analyzeBtn');
    this.resultsContainer = document.getElementById('resultsContainer');
    this.loadingIndicator = document.getElementById('loadingIndicator');
    this.languageSelect = document.getElementById('languageSelect');
    this.sampleSelect = document.getElementById('sampleSelect');
    this.clearBtn = document.getElementById('clearBtn');
    this.copyBtn = document.getElementById('copyBtn');
  }

  bindEvents() {
    this.analyzeBtn.addEventListener('click', () => this.analyzeDiff());
    this.clearBtn.addEventListener('click', () => this.clearAll());
    this.copyBtn.addEventListener('click', () => this.copyResults());
    
    this.diffInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.analyzeDiff();
      }
    });

    this.sampleSelect.addEventListener('change', (e) => {
      const sample = e.target.value;
      if (sample) {
        this.diffInput.value = this.samples[sample];
      }
    });
  }

  loadSampleDiffs() {
    this.samples = {
      'typescript-security': `diff --git a/example.ts b/example.ts
index 123..456
--- a/example.ts
+++ b/example.ts
@@ -1,3 +1,5 @@
+// 存在安全问题的 TypeScript 代码
+const userData: any = getUserInput();
+const password = "硬编码密码_123";
 function processUser(user) {
-  console.log("处理用户");
+  console.log(\`处理用户: \${user.name}\`);
 }`,
      
      'go-concurrency': `diff --git a/concurrent.go b/concurrent.go
index abc..def
--- a/concurrent.go
+++ b/concurrent.go
@@ -1,5 +1,8 @@
 package main
 
+import "time"
+
 func processData() {
+  go func() {
+    time.Sleep(1 * time.Second)
+  }()
   // 处理数据
 }`,
      
      'react-hooks': `diff --git a/Component.tsx b/Component.tsx
index xyz..uvw
--- a/Component.tsx
+++ b/Component.tsx
@@ -1,10 +1,15 @@
 import React, { useState, useEffect } from 'react';
 
 function MyComponent() {
+  const [data, setData] = useState<any>(null);
+  
+  useEffect(() => {
+    // 潜在的内存泄漏
+    fetchData().then(setData);
+  }, []); // 缺少依赖数组
+
   return (
     <div>
-      <h1>Hello World</h1>
+      <h1>你好，世界！</h1>
+      {data && <p>{data.message}</p>}
     </div>
   );
 }`
    };
  }

  async analyzeDiff() {
    const diffContent = this.diffInput.value.trim();
    
    if (!diffContent) {
      this.showMessage('请输入 Git diff 内容进行分析', 'warning');
      return;
    }

    this.showLoading();
    this.disableAnalyzeBtn();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diff: diffContent })
      });

      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态码: ${response.status}`);
      }

      const result = await response.json();
      this.displayResults(result);
    } catch (error) {
      console.error('分析错误:', error);
      this.showError(`分析失败: ${error.message}`);
    } finally {
      this.hideLoading();
      this.enableAnalyzeBtn();
    }
  }

  displayResults(result) {
    if (!result.success) {
      this.showError(`分析失败: ${result.error}`);
      return;
    }

    this.resultsContainer.innerHTML = '';

    // 显示总体风险评估
    const riskScore = document.createElement('div');
    riskScore.className = 'result-item risk-assessment';
    riskScore.innerHTML = `
      <div class="result-header">
        <h3>📊 总体风险评估</h3>
        <span class="severity ${this.getSeverityClass(result.riskScore.riskLevel)}">
          ${this.getRiskLevelText(result.riskScore.riskLevel)}
        </span>
      </div>
      <div class="risk-details">
        <p><strong>风险评分:</strong> ${result.riskScore.riskScore}</p>
        <p><strong>分析文件数:</strong> ${result.files.length}</p>
        <p><strong>检测到的问题:</strong> ${result.recommendations.length}</p>
      </div>
    `;
    this.resultsContainer.appendChild(riskScore);

    // 显示具体建议
    if (result.recommendations && result.recommendations.length > 0) {
      const recommendationsSection = document.createElement('div');
      recommendationsSection.className = 'recommendations-section';
      recommendationsSection.innerHTML = '<h3>🔍 详细分析结果</h3>';
      
      result.recommendations.forEach((rec, index) => {
        const recElement = document.createElement('div');
        recElement.className = `result-item recommendation ${rec.severity}`;
        recElement.innerHTML = `
          <div class="result-header">
            <h4>${rec.message}</h4>
            <span class="severity ${rec.severity}">${this.getSeverityText(rec.severity)}</span>
          </div>
          <div class="recommendation-details">
            <p><strong>类型:</strong> ${this.getTypeText(rec.type)}</p>
            <p><strong>建议:</strong> ${rec.suggestion}</p>
            ${rec.file ? `<p><strong>文件:</strong> ${rec.file}</p>` : ''}
            <div class="action-buttons">
              <button class="btn btn-sm btn-primary" onclick="this.copyToClipboard('${rec.suggestion.replace(/'/g, "\\'")}')">📋 复制建议</button>
            </div>
          </div>
        `;
        recommendationsSection.appendChild(recElement);
      });
      
      this.resultsContainer.appendChild(recommendationsSection);
    } else {
      const noRec = document.createElement('div');
      noRec.className = 'result-item success';
      noRec.innerHTML = `
        <div class="result-header">
          <h4>✅ 代码质量优秀</h4>
          <span class="severity low">良好</span>
        </div>
        <p>未检测到任何问题。代码符合最佳实践标准！</p>
      `;
      this.resultsContainer.appendChild(noRec);
    }
  }

  showLoading() {
    this.loadingIndicator.classList.remove('hidden');
  }

  hideLoading() {
    this.loadingIndicator.classList.add('hidden');
  }

  disableAnalyzeBtn() {
    this.analyzeBtn.disabled = true;
    this.analyzeBtn.innerHTML = '<span class="spinner"></span> 分析中...';
  }

  enableAnalyzeBtn() {
    this.analyzeBtn.disabled = false;
    this.analyzeBtn.innerHTML = '🚀 开始分析';
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `alert alert-${type}`;
    messageElement.textContent = message;
    
    // 移除之前的临时消息
    const existingAlert = document.querySelector('.alert-temporary');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    messageElement.classList.add('alert-temporary');
    this.resultsContainer.insertBefore(messageElement, this.resultsContainer.firstChild);
    
    // 3秒后自动移除
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 3000);
  }

  clearAll() {
    this.diffInput.value = '';
    this.resultsContainer.innerHTML = '';
    this.sampleSelect.value = '';
  }

  copyResults() {
    const resultsText = this.resultsContainer.innerText;
    if (resultsText) {
      navigator.clipboard.writeText(resultsText).then(() => {
        this.showMessage('分析结果已复制到剪贴板', 'success');
      }).catch(() => {
        this.showMessage('复制失败，请手动复制', 'warning');
      });
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showMessage('已复制到剪贴板', 'success');
    });
  }

  getSeverityClass(severity) {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'low';
    }
  }

  getSeverityText(severity) {
    const texts = {
      'high': '高危',
      'medium': '中危', 
      'low': '低危'
    };
    return texts[severity?.toLowerCase()] || '信息';
  }

  getRiskLevelText(level) {
    const texts = {
      'high': '高风险',
      'medium': '中风险',
      'low': '低风险'
    };
    return texts[level?.toLowerCase()] || '未知';
  }

  getTypeText(type) {
    const types = {
      'security': '安全问题',
      'performance': '性能问题',
      'quality': '代码质量',
      'test': '测试覆盖',
      'bug_fix': 'Bug 修复',
      'feature': '新功能'
    };
    return types[type] || type;
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new DiffAgentWeb();
});