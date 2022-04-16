#!/bin/sh

CMDNAME=`basename $0`
if [ $# -ne 2 ]; then
  echo "Usage: $CMDNAME IMG_123.JPG yoshimuraya-001.jpg" 1>&2
  exit 1
fi

org_path=$1
new_path=$2

echo "Move: $org_path to $new_path"
mv $org_path $new_path
echo "Resize and Optimize: $new_path"
sips -Z 800 $new_path
jpegtran -copy none -optimize -outfile $new_path $new_path
sips -g pixelHeight -g pixelWidth $new_path
