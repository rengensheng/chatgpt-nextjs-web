export const streamPost = (url: string, body: any, signal?: AbortSignal) => {
  const token = localStorage.getItem('token')
  return fetch(url, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    } as any,
    body: JSON.stringify(body),
    signal,
  })
}

export const post = (url: string, body: any, signal?: AbortSignal) => {
  const token = localStorage.getItem('token')
  return fetch(url, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    } as any,
    body: JSON.stringify(body),
    signal,
  }).then(response => response.json()).then(res => {
    if (res.code === 401) {
      window.location.href = '/login'
    }
    return res
  })
}