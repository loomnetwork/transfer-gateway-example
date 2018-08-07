#!/usr/bin/env bash

ganache_port=8545

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
  ./node_modules/.bin/ganache-cli -p $ganache_port -m gravity top burden flip student usage spell purchase hundred improve check genre > /dev/null 2>&1 &
  ganache_pid=$!
  echo "ganache-cli started with pid $ganache_pid"
  echo $ganache_pid > ganache.pid
}

if ganache_running; then
  echo "Using existing ganache instance at port $ganache_port"
else
  echo "Starting our own ganache instance at port $ganache_port"
  start_ganache
fi
