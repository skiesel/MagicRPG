package creature

import (
	"math/rand"

	"github.com/skiesel/MagicRPG/utils"
)

type Creature struct {
	Name       string
	MajorClass string
	MinorClass string
	Level      int
	Attack     int
	Defense    int
	HP         int
	MP         int
	XP         int
	Moves      map[string]string
}

func SpawnCreature(majorClass, minorClass string, level int) *Creature {
	if _, found := creatureConfig.CreatureMajorClasses[majorClass]; !found {
		panic("Could not find creature major class: " + majorClass)
	}

	if _, found := creatureConfig.CreatureMajorClasses[majorClass].CreatureMinorClasses[minorClass]; !found {
		panic("Could not find creature minor class: " + majorClass + " " + minorClass)
	}

	creatureClass := creatureConfig.CreatureMajorClasses[majorClass].CreatureMinorClasses[minorClass]

	variableDefinitions := map[string]float64{
		"Level":   float64(level),
		"Attack":  0,
		"Defense": 0,
		"HP":      0,
		"MP":      0,
	}
	expression := utils.ParseExpression(creatureClass.Attack)

	attack := utils.EvaluateExpression(expression, variableDefinitions)

	expression = utils.ParseExpression(creatureClass.Defense)
	defense := utils.EvaluateExpression(expression, variableDefinitions)

	expression = utils.ParseExpression(creatureClass.HP)
	hp := utils.EvaluateExpression(expression, variableDefinitions)

	expression = utils.ParseExpression(creatureClass.MP)
	mp := utils.EvaluateExpression(expression, variableDefinitions)

	creature := &Creature{
		Name:       minorClass,
		MajorClass: majorClass,
		MinorClass: minorClass,
		Level:      level,
		Attack:     int(attack),
		Defense:    int(defense),
		HP:         int(hp),
		MP:         int(mp),
		Moves:      generateMoves(majorClass, minorClass, level),
		XP:         0,
	}

	return creature
}

func generateMoves(majorClass, minorClass string, level int) map[string]string {
	majorCreatureClass := creatureConfig.CreatureMajorClasses[majorClass]
	minorCreatureClass := majorCreatureClass.CreatureMinorClasses[minorClass]

	moves := map[string]string{}

	for key, val := range majorCreatureClass.Moves {
		moves[key] = val.LearnProbability
	}
	for key, val := range minorCreatureClass.Moves {
		moves[key] = val.LearnProbability
	}

	variableDefinitions := map[string]float64{
		"Level": float64(level),
	}

	learnedMoves := map[string]string{}

	// the unorderedness of the maps gives this a little diversity
	for len(learnedMoves) < creatureConfig.MinimumInitialMoves {
		for move, probability := range moves {
			expression := utils.ParseExpression(probability)
			probabilityValue := utils.EvaluateExpression(expression, variableDefinitions)
			if rand.Float64() <= probabilityValue {
				learnedMoves[move] = move
				if len(learnedMoves) >= creatureConfig.MaximumMoves {
					break
				}
			}
		}
	}

	return learnedMoves
}

func (creature *Creature) levelUp() {
	creatureClass := creatureConfig.CreatureMajorClasses[creature.MajorClass].CreatureMinorClasses[creature.MinorClass]
	creature.Level += 1

	variableDefinitions := map[string]float64{
		"Level":   float64(creature.Level),
		"Attack":  float64(creature.Attack),
		"Defense": float64(creature.Defense),
		"HP":      float64(creature.HP),
		"MP":      float64(creature.MP),
	}
	expression := utils.ParseExpression(creatureClass.Attack)
	creature.Attack = int(utils.EvaluateExpression(expression, variableDefinitions))

	expression = utils.ParseExpression(creatureClass.Defense)
	creature.Defense = int(utils.EvaluateExpression(expression, variableDefinitions))

	expression = utils.ParseExpression(creatureClass.HP)
	creature.HP = int(utils.EvaluateExpression(expression, variableDefinitions))

	expression = utils.ParseExpression(creatureClass.MP)
	creature.MP = int(utils.EvaluateExpression(expression, variableDefinitions))
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