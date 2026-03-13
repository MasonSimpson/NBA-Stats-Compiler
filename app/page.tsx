'use client'

import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions as user types
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?name=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 200)
    return () => clearTimeout(timeout)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSearch(name?: string) {
    const searchTerm = name || query
    if (!searchTerm.trim()) return
    setQuery(searchTerm)
    setShowSuggestions(false)
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(`/api/players?name=${encodeURIComponent(searchTerm)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const statCategories: Record<string, string[]> = {
    'Basic Info': ['player_name', 'team_abbreviation', 'age', 'player_height_inches', 'player_weight', 'college', 'country', 'draft_year', 'draft_round', 'draft_number'],
    'Performance': ['gp', 'w', 'l', 'w_pct', 'min', 'pts', 'reb', 'ast', 'stl', 'blk', 'tov', 'plus_minus'],
    'Shooting': ['fgm', 'fga', 'fg_pct', 'fg3m', 'fg3a', 'fg3_pct', 'ftm', 'fta', 'ft_pct', 'efg_pct', 'ts_pct_y'],
    'Advanced': ['off_rating', 'def_rating', 'net_rating_y', 'ast_pct_y', 'usg_pct_y', 'pie', 'pace', 'oreb_pct_y', 'dreb_pct_y', 'reb_pct'],
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0f;
          color: #e8e8f0;
          font-family: 'Barlow', sans-serif;
          min-height: 100vh;
        }

        .header {
          border-bottom: 1px solid #1e1e2e;
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #f97316;
        }

        .header-sub {
          font-size: 0.75rem;
          color: #555570;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 2px;
        }

        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .search-section {
          margin-bottom: 3rem;
        }

        .search-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #555570;
          margin-bottom: 0.75rem;
          display: block;
        }

        .search-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .search-wrapper {
          position: relative;
          width: 360px;
        }

        .search-input {
          background: #13131f;
          border: 1px solid #2a2a3e;
          color: #e8e8f0;
          font-family: 'Barlow', sans-serif;
          font-size: 1rem;
          padding: 0.85rem 1.25rem;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input::placeholder { color: #3a3a55; }
        .search-input:focus { border-color: #f97316; }

        .suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #13131f;
          border: 1px solid #2a2a3e;
          border-top: none;
          z-index: 100;
          max-height: 240px;
          overflow-y: auto;
        }

        .suggestion-item {
          padding: 0.7rem 1.25rem;
          font-size: 0.9rem;
          cursor: pointer;
          border-bottom: 1px solid #1a1a2a;
          transition: background 0.1s;
        }

        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-item:hover { background: #1e1e2e; color: #f97316; }

        .search-btn {
          background: #f97316;
          border: none;
          color: #0a0a0f;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.85rem 1.75rem;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .search-btn:hover { background: #fb923c; }
        .search-btn:disabled { background: #3a3a55; cursor: not-allowed; }

        .status {
          font-size: 0.9rem;
          color: #555570;
          padding: 1rem 0;
        }

        .error {
          color: #ef4444;
          font-size: 0.9rem;
          padding: 1rem 0;
        }

        .player-card {
          background: #13131f;
          border: 1px solid #1e1e2e;
          margin-bottom: 2rem;
        }

        .player-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #1e1e2e;
          display: flex;
          align-items: baseline;
          gap: 1rem;
        }

        .player-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #fff;
        }

        .player-team {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #f97316;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .stat-category {
          border-right: 1px solid #1e1e2e;
          border-bottom: 1px solid #1e1e2e;
          padding: 1.5rem 2rem;
        }

        .stat-category:nth-child(even) { border-right: none; }

        .category-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #f97316;
          margin-bottom: 1rem;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.35rem 0;
          border-bottom: 1px solid #1a1a2a;
        }

        .stat-row:last-child { border-bottom: none; }

        .stat-key {
          font-size: 0.78rem;
          color: #666680;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #e8e8f0;
        }

        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
          .stat-category { border-right: none; }
          .search-wrapper { width: 100%; }
          .search-row { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <header className="header">
        <div>
          <div className="header-logo">NBA Stats</div>
          <div className="header-sub">2023–24 Season</div>
        </div>
      </header>

      <main className="main">
        <div className="search-section">
          <span className="search-label">Search Players</span>
          <div className="search-row">
            <div className="search-wrapper" ref={searchRef}>
              <input
                className="search-input"
                type="text"
                placeholder="Enter player name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              {showSuggestions && (
                <div className="suggestions">
                  {suggestions.map((name, i) => (
                    <div key={i} className="suggestion-item" onMouseDown={() => handleSearch(name)}>
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="search-btn" onClick={() => handleSearch()} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && <p className="error">Error: {error}</p>}
        {results && results.length === 0 && <p className="status">No players found.</p>}

        {results && results.map((player, i) => (
          <div key={i} className="player-card">
            <div className="player-header">
              <span className="player-name">{player.player_name}</span>
              <span className="player-team">{player.team_abbreviation}</span>
            </div>

            <div className="stats-grid">
              {Object.entries(statCategories).map(([category, keys]) => (
                <div key={category} className="stat-category">
                  <div className="category-title">{category}</div>
                  {keys.map((key) => player[key] !== undefined && player[key] !== null && (
                    <div key={key} className="stat-row">
                      <span className="stat-key">{key.replace(/_/g, ' ')}</span>
                      <span className="stat-value">{typeof player[key] === 'number' && !Number.isInteger(player[key]) ? player[key].toFixed(2) : String(player[key])}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  )
}