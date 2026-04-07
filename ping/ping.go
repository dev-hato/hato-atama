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

	res, err := http.Get(fmt.Sprintf("http://localhost:%d/ping", port)) // #nosec G704 -- port is validated as integer in range 1-65535
	if err != nil || res.StatusCode != http.StatusNoContent {
		os.Exit(1)
	}
}
