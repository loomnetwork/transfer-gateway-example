#!/usr/bin/env bash

start_webserver() {
  ./node_modules/.bin/webpack-dev-server --hot --content-base ./dist 2>&1 &
  webclient_pid=$!
  echo "webclient started with pid $webclient_pid"
  echo $webclient_pid > webclient.pid
}

start_webserver
