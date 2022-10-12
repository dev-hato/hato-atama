package main

import (
	"fmt"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	res, err := http.Get(fmt.Sprintf("http://localhost:%s/ping", port))
	if err != nil || res.StatusCode != http.StatusNoContent {
		os.Exit(1)
	}
}
