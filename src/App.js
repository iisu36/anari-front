import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styled from 'styled-components'

import Players from './components/Players'
import Divisions from './components/Divisions'

import PlayerForm from './components/PlayerForm'
import archive2025 from './archives/2025-2026.json'

const baseUrl = '/anari'
const archives = {
  [archive2025.season]: archive2025,
}
const revealTimestamp = Date.parse('2026-09-29T21:00:00.000Z')

const formatCountdown = (seconds) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${days}pv ${String(hours).padStart(2, '0')}:${String(
    minutes,
  ).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: ${3 / 4}fr ${1 / 4}fr;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    'header header'
    'navigation navigation'
    'players divisions'
    'footer footer';
  gap: 8px;
  padding: 8px;

  @media (max-width: 550px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    grid-template-areas:
      'header'
      'navigation'
      'divisions'
      'players'
      'footer';
  }

  header {
    grid-area: header;
    display: flex;
    align-items: center;
    max-height: 3rem;
  }

  header img {
    width: 3rem;
  }

  header h1,
  header h4 {
    color: hsl(27.1, 87.7%, 58.4%);
    text-shadow:
      -1px 1px 2px #000,
      1px 1px 2px #000,
      1px -1px 0 #000,
      -1px -1px 0 #000;
  }

  header h4 {
    margin-left: auto;
    align-self: flex-end;
  }
`

const Navigation = styled.nav`
  grid-area: navigation;
  display: flex;
  gap: 8px;
  align-items: center;

  select {
    padding: 8px;
  }

  button {
    padding: 8px 16px;
    border: 1px solid white;
    border-radius: 4px;
    color: white;
    background: hsl(0, 0%, 20%);
    cursor: pointer;
  }

  button[aria-selected='true'] {
    color: hsl(0, 0%, 10%);
    background: hsl(27.1, 87.7%, 58.4%);
  }
`

const Footer = styled.footer`
  grid-area: footer;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;

  select {
    padding: 8px;
  }

  button {
    padding: 8px 16px;
    border: 1px solid white;
    border-radius: 4px;
    color: white;
    background: hsl(0, 0%, 20%);
    cursor: pointer;
  }

  button[aria-selected='true'] {
    color: hsl(0, 0%, 10%);
    background: hsl(27.1, 87.7%, 58.4%);
  }
`

const App = () => {
  const [standings, setStandings] = useState(false)
  const [players, setPlayers] = useState(false)
  const [statLeader, setStatLeader] = useState(false)
  const [activeTab, setActiveTab] = useState('players')
  const [activeArchive, setActiveArchive] = useState('2025-2026')
  const [clock, setClock] = useState(Date.now())

  const refreshPlayers = () => {
    return axios.get('/anari/players').then((response) => {
      setPlayers(response.data)
    })
  }

  useEffect(() => {
    axios.get(baseUrl).then(
      (response) => {
        setStandings(response.data)
      },
      (reason) => {
        console.log(reason)
        setStandings('error')
      },
    )
    axios.get('/anari/statLeader').then(
      (response) => {
        setStatLeader(response.data)
      },
      () => {
        setStatLeader('error')
      },
    )
    axios.get('/anari/players').then((response) => {
      setPlayers(response.data)
    })

    const timer = setInterval(() => {
      setClock(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const revealReached = clock >= revealTimestamp
  const countdownSeconds = Math.max(
    0,
    Math.ceil((revealTimestamp - clock) / 1000),
  )

  const archive = archives[activeArchive]
  const archiveStandings = Object.fromEntries(
    archive.standings.map((team) => [team.teamId, team]),
  )
  const archiveSelected = activeTab === 'archive'
  const visibleStandings = archiveSelected ? archiveStandings : standings
  const visiblePlayers = archiveSelected ? archive.players : players
  const visibleStatLeader = archiveSelected ? archive.statLeader : statLeader

  useEffect(() => {
    if (!revealReached) {
      return
    }

    setActiveTab('players')
    refreshPlayers()
    axios.get('/anari/statLeader').then(
      (response) => {
        setStatLeader(response.data)
      },
      () => {
        setStatLeader('error')
      },
    )
  }, [revealReached])

  return (
    <Wrapper>
      <header>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/e/e4/NHL_Logo_former.svg"
          alt="-"
        />
        <h1>VEIKKAUS</h1>
        {visibleStatLeader && visibleStatLeader.name && (
          <h4>{`${visibleStatLeader.name}: ${visibleStatLeader.points}`}</h4>
        )}
        {visibleStatLeader === 'error' && <h4>Virhe nhl.com-yhteydessä</h4>}
      </header>

      {(archiveSelected || !revealReached) && (
        <Navigation role="tablist" aria-label="Application views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'players'}
            onClick={() => setActiveTab('players')}
          >
            Etusivu
          </button>
          {!revealReached && !archiveSelected && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'create'}
              onClick={() => setActiveTab('create')}
            >
              Veikkaa
            </button>
          )}
          {archiveSelected ? (
            <>
              <button
                type="button"
                role="tab"
                aria-selected={archiveSelected}
                onClick={() => setActiveTab('archive')}
              >
                Arkisto
              </button>
              <select
                aria-label="Arkistokausi"
                value={activeArchive}
                onChange={(event) => setActiveArchive(event.target.value)}
              >
                {Object.keys(archives).map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <h4>Kiekko tippuu {formatCountdown(countdownSeconds)}</h4>
          )}
        </Navigation>
      )}

      {!standings && <h1>Loading...</h1>}
      {standings === 'error' && <h1>Error in nhl.com</h1>}
      {visibleStandings && visibleStandings['ANA'] && (
        <>
          {(activeTab === 'players' || archiveSelected) && (
            <Divisions standings={visibleStandings}></Divisions>
          )}
          {activeTab === 'create' && !revealReached && (
            <PlayerForm
              standings={standings}
              isOpen={!revealReached}
              onCreated={async () => {
                await refreshPlayers()
                setActiveTab('players')
              }}
            />
          )}
        </>
      )}

      {(activeTab === 'players' || archiveSelected) &&
        visibleStandings &&
        visibleStandings['ANA'] &&
        visiblePlayers && (
          <Players
            standings={visibleStandings}
            players={visiblePlayers}
            statLeader={visibleStatLeader}
          ></Players>
        )}

      {!archiveSelected && (
        <Footer>
          <button
            type="button"
            role="tab"
            aria-selected={archiveSelected}
            onClick={() => setActiveTab('archive')}
          >
            Arkisto
          </button>
        </Footer>
      )}
    </Wrapper>
  )
}

export default App
