package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
)

func main() {
	portStr := os.Getenv("PORT")
	if portStr == "" {
		portStr = "8080"
	}

	port, err := strconv.Atoi(portStr)
	if err != nil {
		panic(err)
	}
	if port < 1 || 65535 < port {
		os.Exit(1)
	}

	res, err := http.Get(
	new(
		url.URL{
			Scheme: "http",
			Host:   net.JoinHostPort("localhost", strconv.Itoa(port)),
			Path:   "/ping",
		},
	).String()
	)
	if err != nil || res.StatusCode != http.StatusNoContent {
		os.Exit(1)
	}
}
