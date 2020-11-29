package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"github.com/davidjwilkins/capstone/auth"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "capstone"
	password = "capstone"
	dbname   = "capstone"
)

var books = LoadBooksCSV()
var bias = make(map[string]float64)
var recommendations = make(map[string][]string)

func main() {
	content, err := ioutil.ReadFile("./data/bias.json")
	if err != nil {
		panic(err)
	}
	json.Unmarshal(content, &bias)
	sort.Slice(books, func(i, j int) bool {
		return bias[books[i].Title] > bias[books[j].Title]
	})
	books_by_title := make(map[string]Book)
	for _, book := range books {
		books_by_title[book.Title] = book
	}
	content, err = ioutil.ReadFile("./data/recommendations.json")
	if err != nil {
		panic(err)
	}
	json.Unmarshal(content, &recommendations)
	var searcher = NewSearcher(books)
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()
	err = db.Ping()
	if err != nil {
		panic(err)
	}
	e := echo.New()
	e.Use(session.Middleware(sessions.NewCookieStore([]byte("IEdKPXJZ%$7qNNz5qw9k"))))
	restricted := e.Group("/admin")
	restricted.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			sess, err := session.Get("session", c)
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, "Internal Server Error")
			}
			if _, ok := sess.Values["userID"]; !ok {
				return echo.NewHTTPError(http.StatusUnauthorized, "You are not authorized to perform this request")
			}
			return next(c)
		}
	})
	restricted.GET("/users", auth.LoadUsers(db))
	e.POST("login", auth.Login(db))
	e.POST("register", auth.Register(db))
	e.GET("/book", func(c echo.Context) error {
		title := c.QueryParam("title")
		recommendTitles := recommendations[title]
		recommendBooks := make([]Book, len(recommendTitles))
		for i, title := range recommendTitles {
			fmt.Println(title)
			recommendBooks[i] = books_by_title[title]
			fmt.Println(books_by_title[title])
		}
		return c.JSON(http.StatusOK, recommendBooks)
	})
	e.GET("/books.json", func(c echo.Context) error {
		page := 0
		if c.QueryParam("page") != "" {
			var err error
			page, err = strconv.Atoi(c.QueryParam("page"))
			if err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, err.Error())
			}
		}
		start := page * 24
		end := (page + 1) * 24
		if start > 10000-24 {
			start = 10000 - 24
		}
		if end > 10000 {
			end = 10000
		}
		if c.QueryParam("q") != "" {
			results := searcher(c.QueryParam("q"))
			if start > len(results) {
				start = len(results) - 24
				if start < 0 {
					start = 0
				}
			}
			if end > len(results) {
				end = len(results)
			}
			return c.JSON(http.StatusOK, results[start:end])
		}
		return c.JSON(http.StatusOK, books[start:end])
	})
	restricted.POST("/books", func (c echo.Context) error {
		var b Book
		err := c.Bind(&b)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		err = db.QueryRowContext(c.Request().Context(), `
			INSERT INTO books (title, original_title, authors, publication_year, average_rating, image_url)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING book_id
		`, b.Title, b.OriginalTitle, strings.Join(b.Authors, ", "), b.PublicationYear, b.AverageRating, b.ImageURL).Scan(&b.ID)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
		return c.JSON(http.StatusOK, b)
	})
	restricted.POST("/ratings", func (c echo.Context) error {
		var r Rating
		err := c.Bind(&r)
		if err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		sess, err := session.Get("session", c)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
		id, ok := sess.Values["userID"].(int)
		if !ok {
			return echo.NewHTTPError(http.StatusInternalServerError, "Invalid user id")
		}
		r.UserID = id
		err = db.QueryRowContext(c.Request().Context(), `
			INSERT INTO ratings (user_id, book_id, rating)
			VALUES ($1, $2, $3)
		`, r.UserID, r.BookID, r.Rating).Scan()
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
		return c.JSON(http.StatusOK, r)
	})
	e.Logger.Fatal(e.Start(":1323"))
}
