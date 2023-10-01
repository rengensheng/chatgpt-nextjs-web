export async function POST(request: Request) {
  const params = await request.json()
  const response = await fetch(`${process.env.PROXY_URL}/api/image/`, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(params)
  })
  return new Response(response.body)
}