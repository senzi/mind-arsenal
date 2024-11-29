// 模拟API返回SVG
export const generateMindMap = async (content, weaponId) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟返回一个简单的SVG
  return `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="#ccc" stroke-width="2"/>
      <text x="200" y="150" text-anchor="middle" fill="#666">
        ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}
      </text>
    </svg>
  `.trim()
}
