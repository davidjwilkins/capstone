package auth

import (
	"database/sql"
	"net/http"
	"strings"
	"fmt"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password`
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func Login(s *sql.DB) func(echo.Context) error {
	return func(c echo.Context) error {
		req := new(LoginRequest)
		if err := c.Bind(req); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		sess, _ := session.Get("session", c)
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 7,
			HttpOnly: true,
		}
		var id int
		var hashedPassword string
		err := s.QueryRowContext(c.Request().Context(), "SELECT id, password FROM users WHERE username = $1", strings.ToLower(req.Username)).Scan(&id, &hashedPassword)
		if err != nil {
			panic(err)
		}
		if !CheckPasswordHash(req.Password, hashedPassword) {
			return echo.NewHTTPError(http.StatusUnauthorized, "This username/password combination does not exist")
		}
		sess.Values["userID"] = id
		sess.Save(c.Request(), c.Response())
		return c.NoContent(http.StatusOK)
	}
}

func Register(s *sql.DB) func(echo.Context) error {
	return func(c echo.Context) error {
		req := new(LoginRequest)
		if err := c.Bind(req); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
		sess, _ := session.Get("session", c)
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 7,
			HttpOnly: true,
		}
		var id int
		hashedPassword, err := HashPassword(req.Password)
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error)
		}
		fmt.Println(hashedPassword)
		s.QueryRowContext(c.Request().Context(), "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id", strings.ToLower(req.Username), hashedPassword).
			Scan(&id)
		if !CheckPasswordHash(req.Password, hashedPassword) {
			return echo.NewHTTPError(http.StatusUnauthorized, "This username/password combination does not exist")
		}
		sess.Values["userID"] = id
		sess.Save(c.Request(), c.Response())
		return c.NoContent(http.StatusOK)
	}
}

type User struct {
	ID int `json:"id"`
	Username string `json:"username"`
}
func LoadUsers(s *sql.DB) func(echo.Context) error {
	return func(c echo.Context) error {
		var users []User
		rows, err := s.QueryContext(c.Request().Context(), "SELECT (id, username) FROM users")
		if err != nil {
			return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
		}
		for rows.Next() {
			user := User{}
			err = rows.Scan(&user.ID, &user.Username)
			if err != nil {
				return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
			}
			users = append(users, user)
		}
		return c.JSON(http.StatusOK, users)
	}
}