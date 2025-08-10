#!/bin/bash

API="https://cdn.tritan.gg/api/upload"
API_KEY=""

screenshot="$(mktemp /tmp/screenshot.XXXXXXXXXX.png)"

cleanup() {
    echo "Cleaning up..."
    rm -f "$screenshot"
    exit 1
}

exit_handler() {
    cleanup
}

open_url() {
    local url=$1
    xdg-open "$url"
}

copy_to_clipboard() {
    local url=$1
    
    if command -v xclip >/dev/null 2>&1; then
        echo -n "$url" | xclip -selection clipboard
        echo "URL copied to clipboard using xclip."
    elif command -v pbcopy >/dev/null 2>&1; then
        echo -n "$url" | pbcopy
        echo "URL copied to clipboard using pbcopy."
    elif command -v clip >/dev/null 2>&1; then
        echo -n "$url" | clip
        echo "URL copied to clipboard using clip."
    else
        display_error "Failed to copy URL to clipboard. Please manually copy the URL: $url."
        return 1
    fi
}

display_error() {
    local error=$1
    zenity --error --text="$error"
}

upload_image() {
    flameshot gui -r > "$screenshot"
    capture_status=$?
    
    if [ $capture_status -ne 0 ]; then
        display_error "Failed to capture screenshot or screenshot aborted."
        cleanup
    fi
    
    response=$(curl -s -H "key: $API_KEY" -F "sharex=@$screenshot" "$API")
    upload_status=$?
    
    if [ $upload_status -ne 0 ]; then
        display_error "Failed to upload image."
        cleanup
    fi
    
    url=$(echo "$response" | grep -oE '"url":"([^"]+)"' | cut -d'"' -f4)
    
    if [ -z "$url" ]; then
        display_error "Failed to get uploaded URL. Response: $response"
        cleanup
    fi
    
    full_url="$url"
}

notify() {
    local url=$1
    
    copy_to_clipboard "$url"
    
    local summary="Tritan ShareX Host"
    local body="The image was uploaded successfully and the URL was copied to the clipboard."
    
    notify-send "$summary" "$body"
    
    # open_url "$url"
}

main() {
    trap exit_handler EXIT
    
    if [ -t 1 ]; then
        upload_image
        notify "$full_url"
    else
        echo "Script is not running in an interactive shell. Skipping."
    fi
    
    cleanup
}

main
