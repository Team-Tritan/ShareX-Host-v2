package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
)

func GetEligableDomains(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	if apiKey == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
	}

	_, err := database.GetUserByKey(apiKey)
	if err != nil {
		return errorResponse(c, constants.StatusNotFound, constants.MessageUserNotFound)
	}

	domains, err := database.GetEligibleDomainsFromDB(apiKey)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedGetDomains)
	}

	return c.JSON(fiber.Map{
		"domains": domains,
	})
}

func AddDomainWithAPIKeyHandler(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	domain := c.Query("domain")
	isPublic := c.Query("public")

	if apiKey == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
	}

	_, err := database.GetUserByKey(apiKey)
	if err != nil {
		return errorResponse(c, constants.StatusNotFound, constants.MessageUserNotFound)
	}

	if domain == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageMissingFields)
	}

	if domain == "" || apiKey == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageMissingFields)
	}

	boolIsPublic, err := strconv.ParseBool(isPublic)
	if err != nil {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidPayload)
	}

	err = database.AddDomainWithAPIKey(domain, apiKey, boolIsPublic)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedAddDomain)
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": "Domain added successfully",
	})
}
