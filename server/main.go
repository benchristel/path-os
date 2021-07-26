package main

import (
	"net/http"
)

func main() {
	http.Handle("/files/", http.StripPrefix("/files", http.FileServer(http.Dir("/"))))
	http.Handle("/", http.FileServer(http.Dir("./client/build")))
	panic(http.ListenAndServe("localhost:1221", nil))
}
