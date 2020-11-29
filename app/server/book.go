package main

import (
	"bufio"
	"encoding/csv"
	"io"
	"log"
	"os"
	"sort"
	"strconv"
	"strings"

	"github.com/lithammer/fuzzysearch/fuzzy"
)

type Book struct {
	ID int `json:"id"`
	// GoodreadsID      int
	// BestBookID       int
	// WorkID           int
	// Count            int
	//ISBN            string   `json:"isbn"`
	//ISBN13          string   `json:"isbn13"`
	Authors         []string `json:"authors"`
	PublicationYear int      `json:"publicationYear"`
	OriginalTitle   string   `json:"originalTitle"`
	Title           string   `json:"title"`
	// LanguageCode     string
	AverageRating float64 `json:"averageRating"`
	// TotalRatings     int
	// TotalWorkRatings int
	// TotalWorkReviews int
	// OneStarRatings   int
	// TwoStarRatings   int
	// ThreeStarRatings int
	// FourStarRatings  int
	// FiveStarRatings  int
	ImageURL string `json:"imageUrl"`
	// SmallImageURL    string
}

func LoadBooksCSV() []Book {
	// Open the file
	csvfile, err := os.Open("./data/books_clean.csv")
	if err != nil {
		log.Fatalln("Couldn't open the csv file", err)
	}

	// Parse the file
	r := csv.NewReader(bufio.NewReader(csvfile))
	r.ReuseRecord = true
	r.Read() // skip the first row

	// create the books array
	var books []Book

	// Iterate through the records
	for {
		// Read each record from csv
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		//0      ,1                ,2           ,3      ,4          ,5   ,6     ,7      ,8
		//book_id,goodreads_book_id,best_book_id,work_id,books_count,isbn,isbn13,authors,original_publication_year,
		//9             ,10   ,11           ,12            ,13           ,14                ,15
		//original_title,title,language_code,average_rating,ratings_count,work_ratings_count,work_text_reviews_count,
		//16       ,17       ,18       ,19       ,20       ,21       ,22
		//ratings_1,ratings_2,ratings_3,ratings_4,ratings_5,image_url,small_image_url
		id, err := strconv.Atoi(record[0])
		if err != nil {
			panic(err)
		}
		publicationYear, err := strconv.ParseFloat(record[8], 64)
		if err != nil && record[8] != "" {
			panic(err)
		}
		averageRating, err := strconv.ParseFloat(record[12], 64)
		if err != nil {
			panic(err)
		}
		books = append(books, Book{
			ID:              id,
			//ISBN:            record[5],
			//ISBN13:          record[6],
			Authors:         strings.Split(record[7], ","),
			PublicationYear: int(publicationYear),
			Title:           record[10],
			OriginalTitle:   record[9],
			AverageRating:   averageRating,
			ImageURL:        record[21],
		})
	}
	return books
}

func NewSearcher(books []Book) func(term string) []Book {
	positions := make(map[string][]int)
	words := []string{}
	for i, book := range books {
		for _, author := range book.Authors {
			if _, ok := positions[author]; !ok {
				positions[author] = []int{}
			}
			positions[author] = append(positions[author], i)
		}
		if _, ok := positions[book.Title]; !ok {
			positions[book.Title] = []int{}
		}
		if _, ok := positions[book.OriginalTitle]; !ok {
			positions[book.OriginalTitle] = []int{}
		}
		positions[book.Title] = append(positions[book.Title], i)
		positions[book.OriginalTitle] = append(positions[book.OriginalTitle], i)
		words = append(words, append([]string{book.Title, book.OriginalTitle}, book.Authors...)...)
	}
	return func(term string) []Book {
		matches := fuzzy.RankFindNormalizedFold(term, words)
		sort.Sort(matches)
		foundBooks := make(map[int]bool)
		matchedBooks := []Book{}
		for _, match := range matches {
			indexes := positions[match.Target]
			for _, index := range indexes {
				if _, ok := foundBooks[index]; !ok {
					foundBooks[index] = true
					matchedBooks = append(matchedBooks, books[index])
				}
			}
		}
		return matchedBooks
	}
}

type Rating struct {
	BookID int `json:"book_id"`
	UserID int `json:"user_id"`
	Rating int `json:"rating"`
}

func LoadRatingsCSV() []Rating {
	// Open the file
	csvfile, err := os.Open("./data/ratings_clean.csv")
	if err != nil {
		log.Fatalln("Couldn't open the csv file", err)
	}

	// Parse the file
	r := csv.NewReader(bufio.NewReader(csvfile))
	r.ReuseRecord = true
	r.Read() // skip the first row

	// create the books array
	var ratings []Rating

	// Iterate through the records
	for {
		// Read each record from csv
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		book_id, err := strconv.Atoi(record[1])
		if err != nil {
			panic(err)
		}
		user_id, err := strconv.Atoi(record[0])
		if err != nil {
			panic(err)
		}
		rating, err := strconv.Atoi(record[2])
		if err != nil {
			panic(err)
		}
		ratings = append(ratings, Rating{
			BookID: book_id,
			UserID: user_id,
			Rating: rating,
		})
	}
	return ratings
}

func RatingsByBookID() map[int][]int {
	ratings := LoadRatingsCSV()
	ratingsByBookID := make(map[int][]int)
	for _, rating := range ratings {
		if _, ok := ratingsByBookID[rating.BookID]; !ok {
			ratingsByBookID[rating.BookID] = []int{0,0,0,0,0}
		}
		ratingsByBookID[rating.BookID][rating.Rating]++
	}
	return ratingsByBookID
}

func OverallRatings() []int {
	ratings := LoadRatingsCSV()
	overall := []int{0,0,0,0,0}
	for _, rating := range ratings {
		overall[rating.Rating]++
	}
	return overall
}