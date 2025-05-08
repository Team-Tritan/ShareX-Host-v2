package middleware

import (
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
)

type RateLimiter struct {
	mu        sync.Mutex
	uploads   map[string]int
	timestamp map[string]time.Time
}

func NewRateLimiter() *RateLimiter {
	return &RateLimiter{
		uploads:   make(map[string]int),
		timestamp: make(map[string]time.Time),
	}
}

func (rl *RateLimiter) Limit(next fiber.Handler) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ip := c.IP()

		rl.mu.Lock()
		defer rl.mu.Unlock()

		if count, exists := rl.uploads[ip]; exists {
			if time.Since(rl.timestamp[ip]) > 30*time.Second {
				rl.uploads[ip] = 0
				rl.timestamp[ip] = time.Now()
			} else if count >= 5 {
				return c.Status(constants.StatusRateLimitExceeded).JSON(fiber.Map{
					"status":  constants.StatusRateLimitExceeded,
					"message": "Rate limit exceeded. Please wait 30 seconds before uploading again.",
				})
			}
		} else {
			rl.timestamp[ip] = time.Now()
		}

		rl.uploads[ip]++
		return next(c)
	}
}
