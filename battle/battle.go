package battle

import (
	"github.com/skiesel/MagicRPG/creature"
	"github.com/skiesel/MagicRPG/player"
	"github.com/skiesel/MagicRPG/utils"

	"github.com/skiesel/goexpr"
)

func ExecuteAttackMove(casterPlayer, targetPlayer *player.Player, casterCreature, targetCreature *creature.Creature, casterMove string) {
	move := &casterCreature.Moves[casterMove]
	casterCreature.MP -= move.MPBurn

	expression := utils.ParseExpression(move.HPImpact)

	variableDefinitions := getVariableDefintions(expression, casterPlayer, targetPlayer, casterCreature, targetCreature)

	targetCreature.HP -= utils.EvaluateExpression(expression, variableDefinitions)

	//side effects?
}

func getVariableDefintions(expression *goexpr.Expression, targetPlayer *player.Player, casterCreature, targetCreature *creature.Creature) map[string]float64 {
	variableDefinitions := map[string]float64{}
	for _, variable := range expression.Vars {
		tokens := strings.Split(variable, "_")
		if strings.Contains(tokens[0], "Player") {
			var player *player.Player
			if strings.Contains(tokens[0], "Caster") {
				player = CasterPlayer
			} else if strings.Contains(tokens[0], "Target") {
				player = TargetPlayer
			} else {
				panic("Unreconized player type")
			}

			switch tokens[1] {
			case "HP":
				variableDefinitions[variable] = player.HP
			case "MP":
				variableDefinitions[variable] = player.MP
			case "Level":
				variableDefinitions[variable] = player.Level
			}
		} else if strings.Contains(tokens[0], "Creature") {
			var creature *creature.Creature
			if strings.Contains(tokens[0], "Caster") {
				creature = CasterCreature
			} else if strings.Contains(tokens[0], "Target") {
				creature = TargetCreature
			} else {
				panic("Unreconized creature type")
			}

			switch tokens[1] {
			case "HP":
				variableDefinitions[variable] = creature.HP
			case "MP":
				variableDefinitions[variable] = creature.MP
			case "Level":
				variableDefinitions[variable] = creature.Level
			}
		} else if strings.Contains(tokens[0], "Noise") {
			mean, err := strconv.ParseFloat(tokens[1], 64)
			if err != nil {
				panic(err)
			}
			stdDev, err := strconv.ParseFloat(tokens[2], 64)
			if err != nil {
				panic(err)
			}
			variableDefinitions[variable] = utils.SampleGaussianValue(mean, stdDev)
		} else {
			panic("Unreconized variable type")
		}
	}

	return variableDefinitions
}
