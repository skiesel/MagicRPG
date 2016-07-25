package player

import (
	"github.com/skiesel/MagicRPG/creature"
	"github.com/skiesel/MagicRPG/inventory"
)

type Player struct {
	Name      string
	Level     int
	XP        int
	Inventory []struct {
		Quantity int
		Item     *inventory.Item
	}
	Creatures []*creature.Creature
}
