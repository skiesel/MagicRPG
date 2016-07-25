package utils

import (
	"errors"
	"math"
	"math/rand"

	"github.com/skiesel/goexpr"
)

var (
	incorrectNumberOfArguments = errors.New("Incorrect number of arguments to function")

	supportedFunctions = map[string]goexpr.FunctionEvaluator{
		"sqrt": func(args []float64) (float64, error) {
			if len(args) != 1 {
				return 0, incorrectNumberOfArguments
			}
			return math.Sqrt(args[0]), nil
		},

		"gaus": func(args []float64) (float64, error) {
			if len(args) != 2 {
				return 0, incorrectNumberOfArguments
			}
			val := rand.NormFloat64()*args[1] + args[0]
			return val, nil
		},
	}
)

type Expression struct {
	expression string
}

func ParseExpression(expression string) *goexpr.Expression {
	exp, err := goexpr.Parse(expression)
	if err != nil {
		panic(err)
	}
	return exp
}

func EvaluateExpression(expression *goexpr.Expression, variableDefinitions map[string]float64) float64 {
	value, err := goexpr.Evaluate(expression, variableDefinitions, supportedFunctions)
	if err != nil {
		panic(err)
	}
	return value
}
