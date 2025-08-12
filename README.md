# Torrent Downloader Application

## Overview
The Torrent Downloader Application is a web-based tool that allows users to input torrent URLs and download the associated files directly to a Linux server on their home network. Once the download is complete, the application automatically transfers the downloaded files to a specified Plex library for easy access and streaming.

## Features
- User-friendly web interface for inputting torrent URLs.
- Downloads torrents using a torrent client library.
- Automatically transfers downloaded media files to a Plex library.
- Accessible from any device on the home network.

## Project Structure
```
torrent-downloader-app
├── src
│   ├── server.js                # Entry point for the application
│   ├── controllers
│   │   ├── torrentController.js  # Handles torrent-related requests
│   │   └── plexController.js     # Manages interactions with Plex
│   ├── routes
│   │   ├── torrentRoutes.js      # Defines routes for torrent operations
│   │   └── plexRoutes.js         # Defines routes for Plex operations
│   ├── services
│   │   ├── torrentService.js      # Logic for downloading torrents
│   │   └── plexService.js         # Manages Plex library interactions
│   ├── utils
│   │   └── fileUtils.js           # Utility functions for file operations
│   └── web
│       ├── public
│       │   └── index.html         # Main HTML file for the web UI
│       └── app.js                 # Client-side JavaScript for the web UI
├── package.json                   # npm configuration file
├── .env                            # Environment variables for configuration
└── README.md                      # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd torrent-downloader-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables in the `.env` file:
   ```
   PLEX_SERVER_ADDRESS=<your-plex-server-address>
   PLEX_API_KEY=<your-plex-api-key>
   ```

4. Start the application:
   ```
   node src/server.js
   ```

## Usage
- Open a web browser and navigate to `http://<your-server-ip>:<port>`.
- Input the torrent URL in the provided form and submit.
- The application will download the torrent and transfer the files to your Plex library.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.