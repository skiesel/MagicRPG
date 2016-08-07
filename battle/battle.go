package battle

import (
	"bufio"
	"fmt"
	"math"
	"math/rand"
	"os"
	"strconv"
	"strings"

	"github.com/skiesel/goexpr"

	"creature"
	"player"
	"utils"
)

type BattleEffect struct {
	AffectedAttribute string
	Impact int
	Turns int
}

func Battle(player1, player2 *player.Player) {
	reader := bufio.NewReader(os.Stdin)
	turn := true
	for player1.Creatures[0].HP > 0 && player2.Creatures[0].HP > 0 {
		var currentPlayer, otherPlayer *player.Player
		if turn {
			fmt.Println("Player 1 Turn")
			currentPlayer = player1
			otherPlayer = player2
		} else {
			fmt.Println("Player 2 Turn")
			currentPlayer = player2
			otherPlayer = player1
		}
		turn = !turn

		var move, moveType string
		for {
			currentPlayer.ListMoves(0)
			move, _ = reader.ReadString('\n')
			move = strings.Replace(move, "\n", "", -1)

			found := false
			moveType, found = currentPlayer.Creatures[0].Moves[move];

			if found {
				break
			}

			fmt.Println("invalid move")
		}
		switch moveType {
			case "Attack":
				ExecuteAttackMove(currentPlayer, otherPlayer, currentPlayer.Creatures[0], otherPlayer.Creatures[0], move)
			case "Defense":
				block := ExecuteDefenseMove(currentPlayer, otherPlayer, currentPlayer.Creatures[0], otherPlayer.Creatures[0], move)
				if block {
					fmt.Println("block next attack")
				}
			case "Attribute":
				battleEffect := ExecuteAttributeMove(currentPlayer, otherPlayer, currentPlayer.Creatures[0], otherPlayer.Creatures[0], move)
				fmt.Println(battleEffect)
		}

		fmt.Println("1 ", player1.Creatures[0].HP)
		fmt.Println("2 ", player2.Creatures[0].HP)
	}
}

func ExecuteAttackMove(casterPlayer, targetPlayer *player.Player, casterCreature, targetCreature *creature.Creature, casterMove string) {
	move := casterCreature.GetAttackMove(casterMove)
	casterCreature.MP -= move.MPBurn
	if casterCreature.MP < 0 {
		panic("insufficient MP for attack move!")
	}

	expression := utils.ParseExpression(move.HPImpact)

	variableDefinitions := getVariableDefintions(expression, casterPlayer, targetPlayer, casterCreature, targetCreature)

	targetCreature.HP -= int(utils.EvaluateExpression(expression, variableDefinitions))

	if targetCreature.HP < 0 {
		targetCreature.HP = 0
	}

	//side effects?
}

func ExecuteDefenseMove(casterPlayer, targetPlayer *player.Player, casterCreature, targetCreature *creature.Creature, casterMove string) bool {
	move := casterCreature.GetDefenseMove(casterMove)
	casterCreature.MP -= move.MPBurn
	if casterCreature.MP < 0 {
		panic("insufficient MP for defense move!")
	}

	expression := utils.ParseExpression(move.BlockProbability)

	variableDefinitions := getVariableDefintions(expression, casterPlayer, targetPlayer, casterCreature, targetCreature)

	probabilityValue := utils.EvaluateExpression(expression, variableDefinitions)

	return rand.Float64() <= probabilityValue
}

func ExecuteAttributeMove(casterPlayer, targetPlayer *player.Player, casterCreature, targetCreature *creature.Creature, casterMove string) BattleEffect {
	move := casterCreature.GetAttributeMove(casterMove)
	casterCreature.MP -= move.MPBurn
	if casterCreature.MP < 0 {
		panic("insufficient MP for attribute move!")
	}

	expression := utils.ParseExpression(move.AttributeImpact)

	variableDefinitions := getVariableDefintions(expression, casterPlayer, targetPlayer, casterCreature, targetCreature)

	attributeImpactValue := utils.EvaluateExpression(expression, variableDefinitions)

	turns := 0
	if move.EffectDuration == "Battle" {
		turns = math.MaxInt32
	} else {
		turns64, err := strconv.ParseInt(move.EffectDuration, 10, 32)
		if err != nil {
			panic(err)
		}
		turns = int(turns64)
	}

	return BattleEffect {
		AffectedAttribute : move.AffectedAttribute,
		Impact : int(attributeImpactValue),
		Turns : turns,
	}
}

func getVariableDefintions(expression *goexpr.Expression, casterPlayer, targetPlayer *player.Player, casterCreature, targetCreature *creature.Creature) map[string]float64 {
	variableDefinitions := map[string]float64{}
	for _, variable := range expression.Vars {

		fmt.Println(variable)

		tokens := strings.Split(variable, "_")
		if strings.Contains(tokens[0], "Player") {
			var player *player.Player
			if strings.Contains(tokens[1], "Caster") {
				player = casterPlayer
			} else if strings.Contains(tokens[1], "Target") {
				player = targetPlayer
			} else {
				panic("Unrecognized player type: " + tokens[0])
			}

			switch tokens[2] {
			// case "HP":
			//	variableDefinitions[variable] = player.HP
			case "MP":
				variableDefinitions[variable] = float64(player.MP)
			case "Level":
				variableDefinitions[variable] = float64(player.Level)
			}
		} else if strings.Contains(tokens[0], "Creature") {
			var creature *creature.Creature
			if strings.Contains(tokens[1], "Caster") {
				creature = casterCreature
			} else if strings.Contains(tokens[1], "Target") {
				creature = targetCreature
			} else {
				panic("Unrecognized creature type: " + tokens[1])
			}

			switch tokens[2] {
			case "HP":
				variableDefinitions[variable] = float64(creature.HP)
			case "MP":
				variableDefinitions[variable] = float64(creature.MP)
			case "Level":
				variableDefinitions[variable] = float64(creature.Level)
			}
		} else {
			panic("Unreconized variable type: " + tokens[1])
		}
	}

	return variableDefinitions
}
