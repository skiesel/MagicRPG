package main

import (
	"fmt"

	"github.com/skiesel/MagicRPG/creature"
	"github.com/skiesel/MagicRPG/player"
)

func main() {
	player1 := &player.Player{}
	player2 := &player.Player{}

	player1.Creatures = append(player1.Creatures, creature.SpawnCreature("Water Fairy", "Young Water Fairy", 1))
	player2.Creatures = append(player2.Creatures, creature.SpawnCreature("Water Fairy", "Young Water Fairy", 1))

	fmt.Println(player1.Creatures[0])
	fmt.Println(player2.Creatures[0])
}
