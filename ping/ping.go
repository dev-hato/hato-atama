package main

import (
	"context"
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

	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, u.String(), nil)
	if err != nil {
		os.Exit(1)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		os.Exit(1)
	}

	if err := res.Body.Close(); err != nil || res.StatusCode != http.StatusNoContent {
		os.Exit(1)
	}
}
