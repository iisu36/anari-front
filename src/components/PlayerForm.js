import styled from 'styled-components'
import { divisions } from '../utils'
import { useReducer, useState } from 'react'
import axios from 'axios'

const colors = {
  Atlantic: 'hsl(354, 71%, 40%)',
  Central: 'hsl(41, 100%, 55%)',
  Metropolitan: 'hsl(17, 98%, 49%)',
  Pacific: 'hsl(220, 67%, 36%)',
}

const Wrapper = styled.div`
  grid-area: players;
  display: grid;
  gap: 4px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const FieldLabel = styled.label`
  color: hsl(27.1, 87.7%, 58.4%);
`

const DivisionWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const CheckboxWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  border: 1px solid white;
  border-radius: 4px;
  background-color: ${(props) => colors[props.division]};

  h2 {
    color: black;
  }
`

const TeamLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  color: black;
  cursor: pointer;

  img {
    width: 42px;
    height: 42px;
    object-fit: contain;
  }
`

const reducer = (state, action) => {
  if (action.reset) {
    return { teams: [] }
  }

  const selected = state.teams.some((team) => team.teamId === action.teamId)
  if (selected) {
    return {
      teams: state.teams.filter((team) => team.teamId !== action.teamId),
    }
  }

  const divisionCount = state.teams.filter(
    (team) => team.division === action.division,
  ).length
  if (divisionCount >= 3) {
    return state
  }

  return {
    teams: [
      ...state.teams,
      { teamId: action.teamId, division: action.division },
    ],
  }
}

const PlayerForm = ({ standings, onCreated, isOpen = true }) => {
  const [state, dispatch] = useReducer(reducer, { teams: [] })
  const [name, setName] = useState('')
  const [statLeader, setStatLeader] = useState('0')
  const [message, setMessage] = useState('')

  const selectedByDivision = divisions.reduce((counts, division) => {
    counts[division] = state.teams.filter(
      (team) => team.division === division,
    ).length
    return counts
  }, {})
  const formComplete = divisions.every(
    (division) => selectedByDivision[division] === 3,
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isOpen) {
      return
    }
    if (!name.trim() || !formComplete) {
      setMessage(
        'Lisää nimi, pistepörssin voittopisteet ja valitse kolme joukkuetta per divisioona.',
      )
      return
    }

    const confirmed = window.confirm(
      `Vahvista veikkaus pelaajalle ${name.trim()}.`,
    )
    if (!confirmed) {
      return
    }

    try {
      await axios.post('/anari/players', {
        name: name.trim(),
        teams: state.teams.map(({ teamId }) => ({ teamId })),
        points: 0,
        statLeader: Number(statLeader),
      })

      await onCreated()
      setMessage('Veikattu.')
      setName('')
      dispatch({ reset: true })
    } catch (error) {
      setMessage(error.response?.data?.error || 'Ei onnistunut.')
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit}>
        <FieldLabel htmlFor="player-name">Nimi</FieldLabel>
        <input
          id="player-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        {standings && (
          <DivisionWrapper>
            {[...divisions].sort().map((division) => {
              return (
                <CheckboxWrapper key={division} division={division}>
                  <h2>{division}</h2>
                  {Object.values(standings)
                    .filter((team) => team.division === division)
                    .sort((a, b) => a.teamName.localeCompare(b.teamName))
                    .map((team) => {
                      const selected = state.teams.some(
                        (selectedTeam) => selectedTeam.teamId === team.teamId,
                      )
                      return (
                        <TeamLabel key={team.teamId} title={team.teamName}>
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={
                              !selected && selectedByDivision[division] >= 3
                            }
                            onChange={() =>
                              dispatch({ teamId: team.teamId, division })
                            }
                          />
                          <img src={team.teamLogo} alt={team.teamName} />
                        </TeamLabel>
                      )
                    })}
                </CheckboxWrapper>
              )
            })}
          </DivisionWrapper>
        )}

        <FieldLabel htmlFor="stat-leader-points">
          Pistepörssin voittopisteet
        </FieldLabel>
        <input
          id="stat-leader-points"
          type="number"
          min="0"
          value={statLeader}
          onChange={(event) => setStatLeader(event.target.value)}
        />
        {message && <p role="status">{message}</p>}
        <button type="submit" disabled={!formComplete || !name.trim()}>
          Veikkaa
        </button>
      </Form>
    </Wrapper>
  )
}

export default PlayerForm
