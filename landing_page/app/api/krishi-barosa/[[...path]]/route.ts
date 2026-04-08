import { NextRequest } from 'next/server'

const DEFAULT_UPSTREAM = 'http://localhost:3003/api'

function getTargetUrl(request: NextRequest, pathParts: string[] | undefined) {
  const upstreamApi = process.env.KRISHI_BAROSA_UPSTREAM_API
  const upstreamBase = process.env.KRISHI_BAROSA_UPSTREAM
  const resolvedBase = upstreamApi || (upstreamBase ? `${upstreamBase.replace(/\/$/, '')}/api` : DEFAULT_UPSTREAM)
  const base = resolvedBase.replace(/\/$/, '')
  const path = pathParts && pathParts.length > 0 ? `/${pathParts.join('/')}` : ''
  const search = request.nextUrl.search || ''
  return `${base}${path}${search}`
}

async function proxy(request: NextRequest, pathParts: string[] | undefined) {
  const target = getTargetUrl(request, pathParts)
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
  }

  let upstream: Response
  try {
    upstream = await fetch(target, init)
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: 'KrishiBarosa upstream is unreachable',
        target,
        hint: 'Start krishi-barosa server (npm run dev in landing_page/krishi-barosa) and restart landing_page dev server after env changes.',
        details: error?.message || String(error),
      },
      { status: 502 }
    )
  }
  const outHeaders = new Headers(upstream.headers)
  outHeaders.delete('content-length')

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  })
}

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}

export async function HEAD(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxy(request, path)
}
