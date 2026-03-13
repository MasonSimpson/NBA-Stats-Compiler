import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name || name.length < 2) {
    return Response.json([])
  }

  const { data, error } = await supabase
    .from('nba_players')
    .select('player_name')
    .ilike('player_name', `%${name}%`)
    .limit(8)

  if (error) return Response.json([])

  return Response.json(data.map((p: any) => p.player_name))
}