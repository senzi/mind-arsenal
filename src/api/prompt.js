// 组装 Prompt
export function assemblePrompt(weapon, userInput) {
  const messages = [
    {
      role: 'system',
      content: weapon.raw_prompt
    },
    {
      role: 'assistant',
      content: weapon.placeholder
    },
    {
      role: 'user',
      content: userInput
    }
  ]
  console.log('发送的messages:', JSON.stringify(messages, null, 2))
  return messages
}

// 调用 API
export async function callAPI(messages, baseUrl, apiKey) {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${apiKey}`)
  headers.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    app_code: 'hzdG6pO3',
    messages
  })

  console.log('发送的完整请求数据:', raw)

  const requestOptions = {
    method: 'POST',
    headers,
    body: raw,
    redirect: 'follow'
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, requestOptions)
    const result = await response.json()
    console.log('API返回的完整数据:', result)
    console.log('提取的content:', result.choices[0].message.content)
    return result.choices[0].message.content
  } catch (error) {
    console.error('API调用错误:', error)
    throw error
  }
}
