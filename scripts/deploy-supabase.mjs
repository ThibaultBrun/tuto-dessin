import "dotenv/config"
import { execSync } from "node:child_process"

function run(cmd) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: "inherit" })
}

// 1) Vérif
const yt = process.env.YT_API_KEY
if (!yt || yt.length < 20) {
  console.error("ERROR: YT_API_KEY missing or too short. Check .env.local")
  process.exit(1)
}

// 2) Push secret
run(`supabase secrets set YT_API_KEY="${yt}"`)

// 3) Deploy function(s)
run(`supabase functions deploy youtube-search`)
