<template>
  <div class="app">
    <div class="container">
      <header class="header panel">
        <div class="header-content">
          <div class="motto">七器启智，破局致远</div>
          <div class="header-actions">
            <button class="settings-btn" @click="showSettings = true">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- 设置对话框 -->
      <div v-if="showSettings" class="settings-modal">
        <div class="settings-content panel">
          <h2>设置</h2>
          <div class="settings-form">
            <div class="form-group">
              <label>Base URL:</label>
              <input 
                type="text" 
                v-model="settings.baseUrl" 
                :placeholder="DEFAULT_BASE_URL"
              >
            </div>
            <div class="form-group">
              <label>API Key:</label>
              <input type="password" v-model="settings.apiKey" placeholder="请输入API密钥">
            </div>
          </div>
          <div class="settings-actions">
            <button @click="saveSettings">保存</button>
            <button class="cancel" @click="showSettings = false">取消</button>
          </div>
        </div>
      </div>

      <router-view v-slot="{ Component }">
        <component :is="Component" v-if="$route.path === '/converter'" />
        <div v-else class="content-wrapper">
          <!-- 左侧武器列表 -->
          <aside class="weapons-list panel">
            <h2>思维器阁</h2>
            <div class="weapons-grid">
              <div
                v-for="weapon in weapons"
                :key="weapon.id"
                class="weapon-button"
                :class="{ active: currentWeapon === weapon.id }"
                @click="selectWeapon(weapon.id)"
              >
                <div class="weapon-name">{{ weapon.name }}</div>
                <div class="weapon-desc">{{ weapon.desc }}</div>
              </div>
            </div>
          </aside>
          
          <!-- 右侧内容区 -->
          <main class="interaction-area">
            <!-- 输入区 -->
            <div class="input-area panel">
              <h2>- 缘起 -</h2>
              <textarea
                v-model="userInput"
                :placeholder="weapons[currentWeapon].placeholder"
                @keyup.enter="handleSubmit"
              ></textarea>
              <button @click="handleSubmit">推演</button>
            </div>
            
            <!-- 输出区 -->
            <div class="output-area panel">
              <h2>- 结果 -</h2>
              <div class="output-container">
                <div v-if="isLoading" class="loading">生成中...</div>
                <div v-else>
                  <div v-html="outputSvg" ref="svgContainer"></div>
                  <a-button v-if="outputSvg" type="primary" @click="downloadAsPng">下载为PNG</a-button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </router-view>
    </div>

    <footer class="footer">
      <div class="footer-content">
        <div class="copyright">
          2024 Mind Arsenal. All rights reserved.
          <a href="https://github.com/sennnnn/mind-arsenal" target="_blank" class="footer-link">GitHub</a>
          <a href="https://opensource.org/licenses/MIT" target="_blank" class="footer-link">MIT License</a>
        </div>
        <div class="disclaimer">
          声明：本工具仅供学习和参考，使用者应对其使用结果负责。作者不对任何因使用本工具而产生的直接或间接损失承担责任。
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import { weapons } from './data/weapons.js'
import { assemblePrompt, callAPI } from './api/prompt'

const DEFAULT_BASE_URL = 'https://api.link-ai.tech/v1'

export default {
  name: 'App',
  setup() {
    const userInput = ref('')
    const currentWeapon = ref(0)
    const isLoading = ref(false)
    const outputSvg = ref('')
    const showSettings = ref(false)
    const settings = ref({
      baseUrl: DEFAULT_BASE_URL,
      apiKey: ''
    })
    const svgContainer = ref(null)

    // 从localStorage加载设置
    onMounted(() => {
      const savedSettings = localStorage.getItem('mindArsenalSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        settings.value = {
          baseUrl: parsed.baseUrl || DEFAULT_BASE_URL,
          apiKey: parsed.apiKey || ''
        }
      }
    })

    // 保存设置到localStorage
    const saveSettings = () => {
      localStorage.setItem('mindArsenalSettings', JSON.stringify(settings.value))
      showSettings.value = false
      Message.success('设置已保存')
    }

    const handleSubmit = async () => {
      if (!userInput.value.trim()) return
      
      isLoading.value = true
      try {
        const messages = assemblePrompt(weapons[currentWeapon.value], userInput.value)
        const replyText = await callAPI(messages, settings.value.baseUrl, settings.value.apiKey)
        outputSvg.value = replyText // SVG 内容直接渲染
      } catch (error) {
        console.error('处理请求错误:', error)
      } finally {
        isLoading.value = false
      }
    }

    const selectWeapon = (id) => {
      currentWeapon.value = id
      userInput.value = ''
      outputSvg.value = ''
    }

    const downloadAsPng = () => {
      const svg = svgContainer.value.querySelector('svg')
      if (!svg) return

      // 创建一个临时canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置canvas尺寸与svg相同
      canvas.width = svg.width.baseVal.value
      canvas.height = svg.height.baseVal.value

      // 将svg转为blob url
      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      // 创建图片对象
      const img = new Image()
      img.onload = () => {
        // 在canvas上绘制图片
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        
        // 将canvas转为png并下载
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'mind-arsenal.png'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 'image/png')
        
        URL.revokeObjectURL(url)
      }
      img.src = url
    }

    return {
      userInput,
      currentWeapon,
      weapons,
      isLoading,
      outputSvg,
      handleSubmit,
      selectWeapon,
      showSettings,
      settings,
      saveSettings,
      DEFAULT_BASE_URL,
      svgContainer,
      downloadAsPng
    }
  }
}
</script>

<style>
:root {
  --primary-color: #8B4513;
  --secondary-color: #DEB887;
  --background-color: #F5DEB3;
  --text-color: #4A4A4A;
  --panel-background: rgba(255, 250, 240, 0.95);
  --border-color: #8B4513;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "FangSong", "仿宋", STFangSong, "华文仿宋", serif;
}

.app {
  min-height: 100vh;
  background-color: var(--background-color);
  background-image: url('./assets/paper-texture.png');
  padding: 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.motto {
  font-size: 1.8rem;
  color: var(--primary-color);
  font-weight: bold;
  letter-spacing: 0.2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.converter-link {
  padding: 0.5rem 1rem;
  color: var(--primary-color);
  text-decoration: none;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.converter-link:hover {
  background-color: var(--primary-color);
  color: white;
}

.content-wrapper {
  display: flex;
  gap: 2rem;
}

.weapons-list {
  width: 300px;
  flex-shrink: 0;
}

.interaction-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.panel {
  background: var(--panel-background);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem 0.5rem 1rem;
  border-bottom: 2px solid var(--border-color);
}

.weapons-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
}

.weapon-button {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(255, 250, 240, 0.6);
}

.weapon-button:hover {
  background-color: var(--secondary-color);
  transform: translateX(5px);
}

.weapon-button.active {
  background-color: var(--primary-color);
  color: white;
  transform: translateX(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.weapon-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.weapon-desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

.weapon-button:hover .weapon-desc,
.weapon-button.active .weapon-desc {
  opacity: 1;
}

.input-area, .output-area {
  width: 100%;
}

.input-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-area textarea {
  width: 100%;
  height: 200px;
  margin: 1rem 0;
  padding: 1rem;
  border: none;
  background: transparent;
  resize: none;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-color);
}

.input-area textarea::placeholder {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  text-align: center;
  color: var(--text-color-light);
  opacity: 0.6;
  white-space: pre-line;
}

.input-area textarea:focus {
  outline: none;
}

button {
  margin-top: 1rem;
  padding: 0.8rem 3rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:hover {
  background-color: #A0522D;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.output-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem;
  border-radius: 4px;
}

.output-svg {
  border: 1px solid var(--border-color);
  max-width: 100%;
  height: auto;
}

.settings-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.settings-btn:hover {
  background-color: rgba(139, 69, 19, 0.1);
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.settings-content {
  width: 400px;
  padding: 2rem;
}

.settings-form {
  margin: 2rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: inherit;
  background-color: rgba(255, 255, 255, 0.7);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.settings-actions button {
  padding: 0.5rem 1.5rem;
}

.settings-actions .cancel {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.settings-actions .cancel:hover {
  background-color: rgba(139, 69, 19, 0.1);
}

.footer {
  margin-top: 3rem;
  padding: 2rem;
  border-top: 1px solid var(--border-color);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  color: var(--text-color);
  opacity: 0.8;
}

.copyright {
  margin-bottom: 1rem;
}

.footer-link {
  margin: 0 1rem;
  color: var(--primary-color);
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.footer-link:hover {
  opacity: 0.8;
}

.disclaimer {
  font-size: 0.9rem;
  line-height: 1.5;
  max-width: 800px;
  margin: 0 auto;
}
</style>
