import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const YT_API_KEY = Deno.env.get("YT_API_KEY")
  if (!YT_API_KEY) return json({ ok: false, error: "Missing YT_API_KEY secret" }, 200)

  const body = await req.json().catch(() => ({}))
  const q = String((body as any)?.q ?? "").trim()

  if (!q) return json({ ok: true, results: [], note: "q is empty" })

  const searchUrl =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&safeSearch=strict&maxResults=10&q=tuto%20dessin%20${encodeURIComponent(q)}&key=${YT_API_KEY}`

  const searchRes = await fetch(searchUrl)
  const searchJson = await searchRes.json()

  const ids = (searchJson.items || [])
    .map((i: any) => i.id?.videoId)
    .filter(Boolean)
    .join(",")

  if (!ids) return json({ ok: true, results: [], note: "no results from search" })

  const detailsUrl =
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${ids}&key=${YT_API_KEY}`

  const detailsRes = await fetch(detailsUrl)
  const detailsJson = await detailsRes.json()

  const results = (detailsJson.items || [])/*.filter((v: any) => v.status?.madeForKids === true)*/.map((v: any) => ({
    youtube_id: v.id,
    title: v.snippet?.title,
    channel: v.snippet?.channelTitle,
    thumbnail: v.snippet?.thumbnails?.medium?.url,
    duration: v.contentDetails?.duration,
    madeForKids: v.status?.madeForKids ?? null,
  }))

  return json({ ok: true, results })
})
