export async function GET(request: Request) {
  const params = await request.url
  const filename = params.split("filename=").pop()
  const response = await fetch(`${process.env.PROXY_URL}/upload/${filename}`, {
    method: "GET",
  })
  return new Response(response.body)
}