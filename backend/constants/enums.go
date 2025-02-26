package constants

import "github.com/gofiber/fiber/v2"

const (
	StatusOK                  = fiber.StatusOK
	StatusUnauthorized        = fiber.StatusUnauthorized
	StatusBadRequest          = fiber.StatusBadRequest
	StatusNotFound            = fiber.StatusNotFound
	StatusInternalServerError = fiber.StatusInternalServerError
	StatusNoContent           = fiber.StatusNoContent
	StatusForbidden           = fiber.StatusForbidden
	StatusConflict            = fiber.StatusConflict
	StatusRateLimitExceeded   = fiber.StatusTooManyRequests
)

const (
	MessageAPIKeyRequired        = "API key is required"
	MessageFailedCreateUser      = "Failed to create user"
	MessageFailedDelete          = "Failed to delete account"
	MessageFailedLoadUsers       = "Failed to load users"
	MessageFailedRegenToken      = "Failed to regenerate token"
	MessageFailedSaveURL         = "Failed to save the URL data"
	MessageFailedToLoadURL       = "Failed to load URL data"
	MessageFailedLoadURLs        = "Failed to load URLs"
	MessageFailedUpdateDomain    = "Failed to update domain"
	MessageFailedUpdateName      = "Failed to update display name"
	MessageFailedUpdateSlug      = "Failed to update the slug"
	MessageFailedFetchUploads    = "Failed to fetch uploads"
	MessageFileUploaded          = "File uploaded successfully"
	MessageInvalidKey            = "Invalid key"
	MessageInvalidPayload        = "Invalid request payload"
	MessageInvalidRequestType    = "Invalid request type"
	MessageNoFileUploaded        = "No file uploaded"
	MessageNewSlugRequired       = "New slug is required"
	MessageSlugExists            = "Slug already exists, choose another one"
	MessageSlugFailed            = "Failed to update the slug"
	MessageSlugNotFound          = "Slug not found"
	MessageSlugUnauthorized      = "Unauthorized to change this slug"
	MessageURLNotFound           = "URL not found"
	MessageURLRequired           = "URL is required"
	MessageUploadError           = "Error deleting upload"
	MessageUploadFailed          = "Failed to upload the fil."
	MessageUploadNotFound        = "Upload not found"
	MessageUploadUnauthorized    = "Unauthorized to delete this upload"
	MessageFailedToCreateSession = "Failed to create S3 session"
	MessageFailedToUploadToS3    = "Failed to upload to S3"
	MessageVerifyFailed          = "Failed to verify the file upload to S3"
	MessageUserCreated           = "User created successfully"
	MessageUserNotFound          = "User not found"
	MessageInternalError         = "Internal server error"
	MessageForbidden             = "Forbidden"
	MessageInvalidRequestBody    = "Invalid request body"
	MessageMissingUploadID       = "Missing upload ID"
	MessageUploadDeleted         = "Upload deleted successfully"
	MessageMissingURLSlug        = "Missing URL slug"
	MessageMissingURL            = "URL not found"
	MessageMissingContent        = "Content not found"
)
