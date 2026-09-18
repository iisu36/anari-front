import Team from './Team'
import { divisions } from '../utils'
import styled from 'styled-components'

const colors = {
  Atlantic: 'hsl(354, 71%, 40%)',
  Central: 'hsl(41, 100%, 55%)',
  Metropolitan: 'hsl(17, 98%, 49%)',
  Pacific: 'hsl(220, 67%, 36%)',
}

const Wrapper = styled.div`
  display: grid;
`
const NameWrapper = styled.div`
  display: flex;
  h2,
  .statleader {
    color: hsl(27.1, 87.7%, 58.4%);
    text-shadow:
      -1px 1px 1px #000,
      1px 1px 1px #000,
      1px -1px 0 #000,
      -1px -1px 0 #000;
    text-transform: uppercase;
  }
  span {
    color: white;
  }

  .statleader {
    margin-left: auto;
    align-self: flex-end;
    padding-bottom: 4px;
  }
`

const TeamsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 3px solid white;
  border-radius: 12px;
  overflow: hidden;
  gap: 3px;
  background-color: white;
`
const DivisionWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background-color: ${(props) => colors[props.division]};
`

const Player = ({ player, playerRank, standings }) => {
  const choicesRevealed = player.choicesRevealed !== false

  return (
    <Wrapper>
      <NameWrapper>
        <h2>
          <span>{playerRank}.</span> {choicesRevealed && `${player.points} `}
          {player.name}
        </h2>
        {choicesRevealed && <h4 className="statleader">{player.statLeader}</h4>}
      </NameWrapper>
      {choicesRevealed && (
        <TeamsWrapper>
          {divisions.map((division) => {
            return (
              <DivisionWrapper
                key={`${(player.name, division)}`}
                division={division}
              >
                {player.teams
                  .filter((team) => team.division === division)
                  .map((team) => {
                    team.teamLogo = standings[team.teamId].teamLogo
                    const key = `${player.name}${team.teamId}`
                    return <Team key={key} team={team}></Team>
                  })}
              </DivisionWrapper>
            )
          })}
        </TeamsWrapper>
      )}
    </Wrapper>
  )
}

export default Player
