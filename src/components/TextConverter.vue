<template>
  <div class="converter-container panel">
    <h2>文本转换工具</h2>
    <div class="input-section">
      <h3>输入多行文本：</h3>
      <textarea 
        v-model="inputText" 
        placeholder="在此输入多行文本..."
        rows="10"
        class="text-input"
      ></textarea>
    </div>
    <div class="output-section">
      <div class="output-header">
        <h3>转换结果：</h3>
        <button @click="copyToClipboard" class="copy-button">
          {{ copyStatus }}
        </button>
      </div>
      <pre class="output-text">{{ convertedText }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextConverter',
  data() {
    return {
      inputText: '',
      copyStatus: '复制',
    }
  },
  computed: {
    convertedText() {
      if (!this.inputText) return '';
      // 将文本转换为可以直接放入单引号中的字符串
      return this.inputText
        .replace(/\\/g, '\\\\')    // 转义反斜杠
        .replace(/'/g, "\\'")      // 转义单引号
        .replace(/\n/g, '\\n')     // 转义换行符
        .replace(/\r/g, '\\r')     // 转义回车符
        .replace(/\t/g, '\\t');    // 转义制表符
    }
  },
  methods: {
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.convertedText);
        this.copyStatus = '已复制！';
        setTimeout(() => {
          this.copyStatus = '复制';
        }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
        this.copyStatus = '复制失败';
      }
    }
  }
}
</script>

<style scoped>
.converter-container {
  width: 800px;
  margin: 20px auto;
  background: var(--panel-background);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 2rem;
}

h2 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.input-section, .output-section {
  width: 100%;
  margin: 20px 0;
}

.text-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: monospace;
  resize: vertical;
  background-color: rgba(255, 255, 255, 0.7);
  height: 300px;
  min-height: 200px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.copy-button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-button:hover {
  background-color: #A0522D;
}

.output-text {
  width: 100%;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  height: 200px;
  min-height: 100px;
  overflow-y: auto;
}
</style>
