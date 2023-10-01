import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const requestBody = await request.json()
  const streamResponse = await fetch(`${process.env.PROXY_URL}/api/chat/completion`, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(requestBody),
    keepalive: true,
  }).then(res => res.body).then(body => {
    if (body === null) {
      return
    }
    const reader = body.getReader()
    return new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          return
        } else {
        controller.enqueue(value)
        }
      }
    })
  })
  return new NextResponse(streamResponse as any);
}