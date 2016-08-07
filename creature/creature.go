package creature

import (
	"fmt"
	"math/rand"

	"utils"
)

type Creature struct {
	Name           string
	MajorClass     string
	MinorClass     string
	Level          int
	Attack         int
	Defense        int
	Evade          int
	HP             int
	MP             int
	XP             int
	EvolutionLevel int
	Moves          map[string]string
}

func SpawnCreature(majorClass, minorClass string, level int) *Creature {
	if _, found := creatureConfig.CreatureMajorClasses[majorClass]; !found {
		panic("Could not find creature major class: " + majorClass)
	}

	if _, found := creatureConfig.CreatureMajorClasses[majorClass].CreatureMinorClasses[minorClass]; !found {
		panic("Could not find creature minor class: " + majorClass + " " + minorClass)
	}

	creatureClass := creatureConfig.CreatureMajorClasses[majorClass].CreatureMinorClasses[minorClass]

	creature := &Creature{
		Name:       minorClass,
		MajorClass: majorClass,
		MinorClass: minorClass,
		Level:      level,
		Moves:      map[string]string{},
	}

	creature.generateMoves()
	creature.generateStats()

	expression := utils.ParseExpression(creatureClass.EvolutionLevel)
	creature.EvolutionLevel = int(utils.EvaluateExpression(expression, creature.getStatsAsMap()))

	return creature
}

func (creature *Creature) ListMoves() {
	for move, moveType := range creature.Moves {
		var description string
		switch moveType {
		case "Attack":
			description = creature.GetAttackMove(move).Description
		case "Defense":
			description = creature.GetDefenseMove(move).Description
		case "Attribute":
			description = creature.GetAttributeMove(move).Description
		}

		fmt.Println(move, " : ", description)
	}
}

func (creature *Creature) GetAttackMove(move string) AttackMove {
	m, found := creatureConfig.Moves.Attack[move]
	if !found {
		panic("could not find attack move")
	}
	return m
}

func (creature *Creature) GetDefenseMove(move string) DefenseMove {
	m, found := creatureConfig.Moves.Defend[move]
	if !found {
		panic("could not find defense move")
	}
	return m
}

func (creature *Creature) GetAttributeMove(move string) AttributeMove {
	m, found := creatureConfig.Moves.Attribute[move]
	if !found {
		panic("could not find attribute move")
	}
	return m
}

func (creature *Creature) generateMoves() {
	majorCreatureClass := creatureConfig.CreatureMajorClasses[creature.MajorClass]
	minorCreatureClass := majorCreatureClass.CreatureMinorClasses[creature.MinorClass]

	moves := map[string]string{}

	for key, val := range majorCreatureClass.Moves {
		moves[key] = val.LearnProbability
	}
	for key, val := range minorCreatureClass.Moves {
		moves[key] = val.LearnProbability
	}

	variableDefinitions := creature.getStatsAsMap()

	// the unorderedness of the maps gives this a little diversity
	for len(creature.Moves) < creatureConfig.MinimumInitialMoves {
		for move, probability := range moves {
			expression := utils.ParseExpression(probability)
			probabilityValue := utils.EvaluateExpression(expression, variableDefinitions)
			if rand.Float64() <= probabilityValue {
				var moveType string
				if _, found := creatureConfig.Moves.Attack[move]; found {
					moveType = "Attack"
				} else if _, found := creatureConfig.Moves.Defend[move]; found {
					moveType = "Defense"
				} else if _, found := creatureConfig.Moves.Attribute[move]; found {
					moveType = "Attribute"
				} else {
					fmt.Println("could not resolve move type")
				}

				creature.Moves[move] = moveType
				if len(creature.Moves) >= creatureConfig.MaximumMoves {
					break
				}
			}
		}
	}
}

func (creature *Creature) levelUp() {
	creature.Level += 1

	evolved := false

	if creature.Level == creature.EvolutionLevel {
		//Prompt before leveling up, but for now, level up by default

		for i, class := range creatureConfig.CreatureMajorClasses[creature.MajorClass].EvolutionProgression {
			if creature.MinorClass == class {
				i++
				if i < len(creatureConfig.CreatureMajorClasses[creature.MajorClass].EvolutionProgression) {
					creature.MinorClass = creatureConfig.CreatureMajorClasses[creature.MajorClass].EvolutionProgression[i]
					evolved = true
				}
				break
			}
		}
	}

	creature.generateStats()

	if evolved {
		expression := utils.ParseExpression(creatureConfig.CreatureMajorClasses[creature.MajorClass].CreatureMinorClasses[creature.MinorClass].EvolutionLevel)
		creature.EvolutionLevel = int(utils.EvaluateExpression(expression, creature.getStatsAsMap()))
		if creature.EvolutionLevel <= creature.Level {
			creature.EvolutionLevel = creature.Level + 1
		}
	}
}

func (creature *Creature) generateStats() {
	creatureClass := creatureConfig.CreatureMajorClasses[creature.MajorClass].CreatureMinorClasses[creature.MinorClass]

	variableDefinitions := creature.getStatsAsMap()

	expression := utils.ParseExpression(creatureClass.Attack)
	creature.Attack = int(utils.EvaluateExpression(expression, variableDefinitions))

	expression = utils.ParseExpression(creatureClass.Defense)
	creature.Defense = int(utils.EvaluateExpression(expression, variableDefinitions))

	expression = utils.ParseExpression(creatureClass.Evade)
	creature.Evade = int(utils.EvaluateExpression(expression, variableDefinitions))

	expression = utils.ParseExpression(creatureClass.HP)
	creature.HP = int(utils.EvaluateExpression(expression, variableDefinitions))

	expression = utils.ParseExpression(creatureClass.MP)
	creature.MP = int(utils.EvaluateExpression(expression, variableDefinitions))
}

func (creature *Creature) getStatsAsMap() map[string]float64 {
	return map[string]float64{
		"Level":   float64(creature.Level),
		"Attack":  float64(creature.Attack),
		"Defense": float64(creature.Defense),
		"Evade":   float64(creature.Evade),
		"HP":      float64(creature.HP),
		"MP":      float64(creature.MP),
	}
}
