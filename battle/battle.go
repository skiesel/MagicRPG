package battle

import (
	"math"
	"math/rand"
	"strconv"
	"strings"

	"github.com/skiesel/MagicRPG/creature"
	"github.com/skiesel/MagicRPG/player"
	"github.com/skiesel/MagicRPG/utils"

	"github.com/skiesel/goexpr"
)

type BattleEffect struct {
	AffectedAttribute string
	Impact int
	Turns int
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
	if move.EffectDuration == "battle" {
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
		tokens := strings.Split(variable, "_")
		if strings.Contains(tokens[0], "Player") {
			var player *player.Player
			if strings.Contains(tokens[0], "Caster") {
				player = casterPlayer
			} else if strings.Contains(tokens[0], "Target") {
				player = targetPlayer
			} else {
				panic("Unreconized player type")
			}

			switch tokens[1] {
			// case "HP":
			// 	variableDefinitions[variable] = player.HP
			case "MP":
				variableDefinitions[variable] = float64(player.MP)
			case "Level":
				variableDefinitions[variable] = float64(player.Level)
			}
		} else if strings.Contains(tokens[0], "Creature") {
			var creature *creature.Creature
			if strings.Contains(tokens[0], "Caster") {
				creature = casterCreature
			} else if strings.Contains(tokens[0], "Target") {
				creature = targetCreature
			} else {
				panic("Unreconized creature type")
			}

			switch tokens[1] {
			case "HP":
				variableDefinitions[variable] = float64(creature.HP)
			case "MP":
				variableDefinitions[variable] = float64(creature.MP)
			case "Level":
				variableDefinitions[variable] = float64(creature.Level)
			}
		} else {
			panic("Unreconized variable type")
		}
	}

	return variableDefinitions
}
