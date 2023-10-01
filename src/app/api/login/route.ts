export async function POST(request: Request) {
  const userLogin = await request.json()
  const response = await fetch(`${process.env.PROXY_URL}/api/webUser/login`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userLogin)
  })
  return new Response(response.body)
}