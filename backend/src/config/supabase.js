import { createClient } from "@supabase/supabase-js"
import ws from "ws"

const supabase = createClient(
  process.env.DATABASE_URL,
  process.env.DIRECT_URL,
  {
    realtime: {
      transport: ws
    }
  }
)

export default supabase;