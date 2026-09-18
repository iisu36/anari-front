import Player from './Player'

import styled from 'styled-components'

const Wrapper = styled.div`
  grid-area: players;
  display: grid;
  gap: 4px;
`

const Players = ({ players, standings, statLeader }) => {
  const countedPlayers = countPoints(players, standings, statLeader)
  let playerRank = 1

  return (
    <Wrapper>
      {countedPlayers.map((player) => {
        return (
          <Player
            key={player.name}
            player={player}
            playerRank={playerRank++}
            standings={standings}
          ></Player>
        )
      })}
    </Wrapper>
  )
}

const countPoints = (players, standings, statLeader) => {
  const countedPlayers = [...players]

  if (countedPlayers.some((player) => player.choicesRevealed === false)) {
    return countedPlayers.sort((a, b) => a.name.localeCompare(b.name))
  }

  countedPlayers.forEach((player) => {
    player.points = 0
    player.teams.forEach((playerTeam) => {
      const team = standings[playerTeam.teamId]
      playerTeam.points = team.points
      playerTeam.name = team.teamName
      playerTeam.rank = team.leagueRank
      playerTeam.division = team.division
      playerTeam.divisionRank = team.divisionRank

      player.points += team.points
    })

    player.teams.sort((a, b) => parseInt(a.rank) - parseInt(b.rank))
  })

  countedPlayers.sort((a, b) => {
    if (a.points === b.points) {
      return (
        Math.abs(a.statLeader - statLeader.points) -
        Math.abs(b.statLeader - statLeader.points)
      )
    }
    return b.points - a.points
  })
  return countedPlayers
}

export default Players
