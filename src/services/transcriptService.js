// API服务 - 用于调用后端更新API
export const updateTranscript = async (eventId, content) => {
  const apiUrl = 'https://api.peak-note.com/transcript/update';
  // const apiUrl = 'https://e33c2f60f987.ngrok-free.app/transcript/update';
  const requestBody = {
    eventId: eventId,
    content: JSON.stringify(content) // 后端期望字符串类型
  };

  console.log('📤 Sending to backend:', {
    eventId,
    contentType: typeof content,
    contentPreview: JSON.stringify(content).substring(0, 100) + '...',
    fullContent: content
  });


  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      // 尝试获取错误详情
      let errorDetails = '';
      try {
        const errorText = await response.text();
        errorDetails = errorText;
        console.error('❌ Server error details:', errorText);
      } catch (e) {
        console.error('❌ Could not read error response');
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
    }

    const result = await response.text();
    console.log('✅ Save successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Save failed:', error);
    throw error;
  }
};
