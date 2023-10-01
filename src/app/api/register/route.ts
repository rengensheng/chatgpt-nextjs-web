export async function POST(request: Request) {
  const userInfo = await request.json()
  const response = await fetch(`${process.env.PROXY_URL}/api/webUser/register`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userInfo)
  })
  return new Response(response.body)
}