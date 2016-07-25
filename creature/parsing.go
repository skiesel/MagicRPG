package creature

import (
	"fmt"
	"io/ioutil"

	"gopkg.in/yaml.v2"
)

var (
	creatureConfig = CreatureConfig{}
)

func init() {
	creatureFile, err := ioutil.ReadFile("creatures.yaml")
	checkError(err)

	err = yaml.Unmarshal(creatureFile, &creatureConfig)
	checkError(err)
}

func checkError(err error) {
	if err != nil {
		panic(err)
	}
}

func PrintConfig() {
	d, err := yaml.Marshal(&creatureConfig)
	checkError(err)
	fmt.Printf("%s\n", string(d))
}

type CreatureConfig struct {
	ElementalAttributes []string `yaml:"ElementalAttributes"`
	MinimumInitialMoves int      `yaml:"MinimumInitialMoves"`
	MaximumMoves        int      `yaml:"MaximumMoves"`

	CreatureMajorClasses map[string]struct {
		Elemental            string                 `yaml:"Elemental"`
		Moves                map[string]LearnedMove `yaml:"Moves"`
		CreatureMinorClasses map[string]struct {
			Attack  string                 `yaml:"Attack"`
			Defense string                 `yaml:"Defense"`
			HP      string                 `yaml:"HP"`
			MP      string                 `yaml:"MP"`
			Moves   map[string]LearnedMove `yaml:"Moves"`
		} `yaml:"CreatureMinorClasses"`
	} `yaml:"CreatureMajorClasses"`

	Moves struct {
		Attack map[string]struct {
			GeneralMove `yaml:",inline"`
			HPImpact    string `yaml:"HPImpact"`
		} `yaml:"Attack"`
		Defend map[string]struct {
			GeneralMove      `yaml:",inline"`
			BlockProbability string `yaml:"BlockProbability"`
		} `yaml:"Defend"`
		Attribute map[string]struct {
			GeneralMove       `yaml:",inline"`
			EffectDuration    string `yaml:"EffectDuration"`
			EffectedAttribute string `yaml:"EffectedAttribute"`
			AttributeImpact   string `yaml:"AttributeImpact"`
		} `yaml:"Attribute"`
	} `yaml:"Moves"`
}

type GeneralMove struct {
	Description        string `yaml:"Description"`
	ElementalAttribute string `yaml:"ElementalAttribute"`
	MPBurn             int    `yaml:"MPBurn"`
}

type LearnedMove struct {
	LearnProbability string `yaml:"LearnProbability"`
}
