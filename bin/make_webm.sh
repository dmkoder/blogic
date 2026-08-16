#!/usr/bin/env bash

set -e

trap 'rm -rf frames' EXIT

input="$1"

if [ -z "$input" ]; then
    echo "Usage: $0 <file.smte>"
    exit 1
fi

if [ ! -f "$input" ]; then
    echo "Error: file not found: $input"
    exit 1
fi

filename=$(basename -- "$input")
name="${filename%.*}"
output_dir=$(dirname -- "$input")

echo "Generating frames from $input..."

npx scriptimate@latest \
    -i "$input" \
    -if png \
    -nc 1

echo "Generating $output_dir/$name.webm..."

ffmpeg -framerate 25 \
    -i frames/%07d.png \
    -c:v libvpx-vp9 \
    -pix_fmt yuva420p \
    -auto-alt-ref 0 \
    -b:v 0 \
    -crf 30 \
    -an \
    "$output_dir/$name.webm"

rm -rf frames

echo "Done: $output_dir/$name.webm"