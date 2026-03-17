package handlers

import (
	"math"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func requireAdmin(c *fiber.Ctx) (database.User, bool) {
	apiKey := c.Get("key")
	if apiKey == "" {
		_ = errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
		return database.User{}, false
	}

	requestingUser, err := database.GetUserByKey(apiKey)
	if err != nil {
		_ = errorResponse(c, constants.StatusUnauthorized, constants.MessageInvalidKey)
		return database.User{}, false
	}

	if !requestingUser.Admin {
		_ = errorResponse(c, constants.StatusForbidden, constants.MessageForbidden)
		return database.User{}, false
	}

	return requestingUser, true
}

func getPagination(c *fiber.Ctx) (int64, int64, error) {
	page := int64(1)
	limit := int64(25)

	if rawPage := c.Query("page"); rawPage != "" {
		parsedPage, err := strconv.Atoi(rawPage)
		if err != nil || parsedPage < 1 {
			return 0, 0, fiber.NewError(constants.StatusBadRequest, constants.MessageInvalidRequest)
		}
		page = int64(parsedPage)
	}

	if rawLimit := c.Query("limit"); rawLimit != "" {
		parsedLimit, err := strconv.Atoi(rawLimit)
		if err != nil || parsedLimit < 1 {
			return 0, 0, fiber.NewError(constants.StatusBadRequest, constants.MessageInvalidRequest)
		}
		if parsedLimit > 100 {
			parsedLimit = 100
		}
		limit = int64(parsedLimit)
	}

	return page, limit, nil
}

func GetAdminUsers(c *fiber.Ctx) error {
	if _, ok := requireAdmin(c); !ok {
		return nil
	}

	page, limit, err := getPagination(c)
	if err != nil {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequest)
	}
	query := c.Query("q")

	users, total, err := database.LoadUsersPaginated(page, limit, query)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedLoadUsers)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	return c.JSON(fiber.Map{
		"status":      constants.StatusOK,
		"count":       len(users),
		"query":       query,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
		"users":       users,
	})
}

func GetAdminRecentUploads(c *fiber.Ctx) error {
	if _, ok := requireAdmin(c); !ok {
		return nil
	}

	page, limit, err := getPagination(c)
	if err != nil {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequest)
	}
	query := c.Query("q")

	uploads, total, err := database.LoadRecentUploadsPaginated(page, limit, query)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedFetchUploads)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	return c.JSON(fiber.Map{
		"status":      constants.StatusOK,
		"count":       len(uploads),
		"query":       query,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
		"uploads":     uploads,
	})
}

func GetAdminUploadsByUser(c *fiber.Ctx) error {
	if _, ok := requireAdmin(c); !ok {
		return nil
	}

	userKey := c.Params("key")
	if userKey == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequest)
	}

	page, limit, err := getPagination(c)
	if err != nil {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequest)
	}
	query := c.Query("q")

	uploads, total, err := database.LoadUploadsByKeyPaginated(userKey, page, limit, query)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedFetchUploads)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	return c.JSON(fiber.Map{
		"status":      constants.StatusOK,
		"count":       len(uploads),
		"query":       query,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
		"uploads":     uploads,
	})
}

func DeleteAdminUpload(c *fiber.Ctx) error {
	if _, ok := requireAdmin(c); !ok {
		return nil
	}

	fileName := c.Params("file")
	if fileName == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageMissingUploadID)
	}

	entry, err := database.DeleteUploadByFileName(fileName)
	if err != nil {
		return errorResponse(c, constants.StatusNotFound, constants.MessageUploadNotFound)
	}

	if err := functions.DeleteFileFromS3(entry.FileName); err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageUploadError)
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": constants.MessageUploadDeleted,
	})
}

func DeleteAdminUser(c *fiber.Ctx) error {
	adminUser, ok := requireAdmin(c)
	if !ok {
		return nil
	}

	userKey := c.Params("key")
	if userKey == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequest)
	}
	if userKey == adminUser.Key {
		return errorResponse(c, constants.StatusBadRequest, "Admins cannot delete their own account from admin API")
	}

	uploads, err := database.LoadUploadsFromDB(userKey)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedFetchUploads)
	}

	for _, upload := range uploads {
		if err := functions.DeleteFileFromS3(upload.FileName); err != nil {
			return errorResponse(c, constants.StatusInternalServerError, constants.MessageUploadError)
		}
	}

	if err := database.DeleteUserByKey(userKey); err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedDelete)
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": "User deleted successfully",
	})
}

func DeleteAdminUserUploads(c *fiber.Ctx) error {
	if _, ok := requireAdmin(c); !ok {
		return nil
	}

	userKey := c.Params("key")
	if userKey == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequest)
	}

	uploads, err := database.LoadUploadsFromDB(userKey)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedFetchUploads)
	}

	for _, upload := range uploads {
		if err := functions.DeleteFileFromS3(upload.FileName); err != nil {
			return errorResponse(c, constants.StatusInternalServerError, constants.MessageUploadError)
		}
	}

	deletedCount, err := database.DeleteUploadsByUserKey(userKey)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedDelete)
	}

	return c.JSON(fiber.Map{
		"status":        constants.StatusOK,
		"deleted_count": deletedCount,
		"message":       "User uploads deleted successfully",
	})
}

func UpdateAdminUserDisplayName(c *fiber.Ctx) error {
	if _, ok := requireAdmin(c); !ok {
		return nil
	}

	userKey := c.Params("key")
	if userKey == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequest)
	}

	var payload struct {
		DisplayName string `json:"display_name"`
	}
	if err := c.BodyParser(&payload); err != nil || payload.DisplayName == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidPayload)
	}

	if err := database.UpdateUserDisplayName(userKey, payload.DisplayName); err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedUpdateName)
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": "User display name updated",
	})
}

func RerollAdminUserKey(c *fiber.Ctx) error {
	if _, ok := requireAdmin(c); !ok {
		return nil
	}

	userKey := c.Params("key")
	if userKey == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequest)
	}

	newKey := functions.GenerateAPIKey(20)
	if err := database.UpdateUserKey(userKey, newKey); err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedRegenToken)
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": "User key rerolled",
		"new_key": newKey,
	})
}
