'use client'

import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(`/api/players?name=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>NBA Stats Search</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter player name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ padding: '0.5rem', width: '300px', marginRight: '0.5rem' }}
        />
        <button onClick={handleSearch} style={{ padding: '0.5rem 1rem' }}>
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {results && results.length === 0 && <p>No players found.</p>}

      {results && results.length > 0 && results.map((player, i) => (
        <div key={i} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <h2>{player.PLAYER_NAME}</h2>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              {Object.entries(player).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px', fontWeight: 'bold', width: '200px' }}>{key}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </main>
  )
}