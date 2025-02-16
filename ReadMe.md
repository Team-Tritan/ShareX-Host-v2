# Tritan ShareX Host

Tritan's ShareX Host is a self-hosted solution for managing and sharing images and URLs using ShareX. This project provides a web interface for uploading images, managing shortened URLs, and viewing upload statistics.

## Features

- **Image Uploading**: Easily upload images using the web interface or ShareX.
- **URL Shortening**: Create and manage shortened URLs.
- **User Authentication**: Secure access with API keys.
- **Upload Management**: View, delete, and manage uploaded images.
- **URL Management**: View, edit, and delete shortened URLs.
- **Statistics**: Track views and clicks for uploads and URLs.
- **Responsive Design**: Mobile-friendly interface.

## Getting Started

### Prerequisites

- [Go](https://golang.org/dl/) (version 1.21 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (version 7.0 or higher)
- [Node.js](https://nodejs.org/en/download/) (version 18 or higher)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/Team-Tritan/ShareX-Host-v2.git
   cd ShareX-Host-v2
   ```

2. Install dependencies:

   ```sh
   go mod tidy
   ```

3. Set up the configuration:

   Fill in the config/config.go file with applicable settings.

5. Run the server:

   ```sh
   go run main.go
   ```

6. Open your browser and navigate to `http://localhost:8080`.

### Usage

1. **Login**: Enter your API key to log in.
2. **Upload Images**: Drag and drop images to upload or use the ShareX configuration.
3. **Manage Uploads**: View, delete, and manage your uploaded images.
4. **Shorten URLs**: Create and manage shortened URLs.
5. **View Statistics**: Track views and clicks for your uploads and URLs.

### Configuration

To configure ShareX for image uploading and URL shortening, use the provided configuration links in the web interface.

### API Endpoints

- **Upload Image**: `/api/upload`
- **Get Uploads**: `/api/uploads`
- **Delete Upload**: `/api/delete-upload/{slug}`
- **Create URL**: `/api/create-url`
- **Get URLs**: `/api/urls`
- **Delete URL**: `/api/delete-url/{slug}`
- **Update URL Slug**: `/api/url/{slug}`

### Contributing

Contributions are welcome! Please open an issue or submit a pull request.

### License

This project is licensed under the Apache License.

### Acknowledgements

- [ShareX](https://getsharex.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [jQuery](https://jquery.com/)
- [MongoDB](https://www.mongodb.com/)
