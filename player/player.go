package player

import (
	"creature"
	"inventory"
)

type Player struct {
	Name      string
	Level     int
	MP        int
	XP        int
	Inventory []struct {
		Quantity int
		Item     *inventory.Item
	}
	Creatures []*creature.Creature
}

func (player *Player) ListMoves(which int) {
	if which < 0 || which > len(player.Creatures) {
		panic("Can't list moves for out of bounds creature")
	}
	player.Creatures[which].ListMoves()
}