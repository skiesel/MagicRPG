package main

import (
	"appengine"
	"appengine/user"
	"fmt"
	"math/rand"
	"net/http"
	"html/template"

	"github.com/gorilla/mux"



	// "github.com/skiesel/MagicRPG/creature"
	// "github.com/skiesel/MagicRPG/player"
	// "github.com/skiesel/MagicRPG/battle"
)

var (
	pages *template.Template
	devs = []string{"Steve", "Scott"}
)

func init() {
	pages = template.Must(template.ParseGlob("client/*.html"))

	r := mux.NewRouter()
	r.HandleFunc("/", getIndex).Methods("GET")
	r.PathPrefix("/client/").Handler(http.StripPrefix("/client/", http.FileServer(http.Dir("client"))))
	r.HandleFunc("/account/", getAccount).Methods("GET")
	http.Handle("/", r)
}


func getAccount(w http.ResponseWriter, r *http.Request) {
	// c := appengine.NewContext(r)
	// u := user.Current(c)

	fmt.Fprintf(w, "test")
}

func getIndex(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	u := user.Current(c)

	if u == nil {
		showLogin(w, c)
		return
	}

	err := pages.ExecuteTemplate(w, "index.html", nil)
	if err != nil {
		http.Error(w, "Failed to render the page.", http.StatusInternalServerError)
		c.Errorf("failed to render index: %v", err)
		return
	}
}

func showLogin(w http.ResponseWriter, c appengine.Context) {
	login, err := user.LoginURL(c, "/")
	if err != nil {
		showError(w, askWho(), http.StatusInternalServerError, c)
		c.Errorf("Failed to get login url: %v", err)
		return
	}

	err = pages.ExecuteTemplate(w, "login.html", login)
	if err != nil {
		http.Error(w, "Failed to render the page.", http.StatusInternalServerError)
		c.Errorf("failed to render login: %v", err)
		return
	}
}

func askWho() string {
	return fmt.Sprintf("Ask %s to look.", devs[rand.Intn(len(devs))])
}

func showError(w http.ResponseWriter, msg string, status int, c appengine.Context) {
	err := pages.ExecuteTemplate(w, "oops.html", map[string]string{
		"Message": msg,
		"Status":  http.StatusText(status),
	})
	if err != nil {
		http.Error(w, "Failed to render the page.", http.StatusInternalServerError)
		c.Errorf("failed to render error: %v", err)
		return
	}
}

func main() {



	// player1 := &player.Player{}
	// player2 := &player.Player{}

	// player1.Creatures = append(player1.Creatures, creature.SpawnCreature("Water Fairy", "Young Water Fairy", 1))
	// player2.Creatures = append(player2.Creatures, creature.SpawnCreature("Water Fairy", "Young Water Fairy", 1))

	// fmt.Println(player1.Creatures[0])
	// fmt.Println(player2.Creatures[0])

	// battle.Battle(player1, player2)
}
