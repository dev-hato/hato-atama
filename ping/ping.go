package main

import (
	"net"
	"net/http"
	"net/url"
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

	u := url.URL{
		Scheme: "http",
		Host:   net.JoinHostPort("localhost", strconv.Itoa(port)),
		Path:   "/ping",
	}

	res, err := http.Get(u.String())
	if err != nil || res.StatusCode != http.StatusNoContent {
		os.Exit(1)
	}
}
