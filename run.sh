#!/bin/bash
if [ ! -d redis-stable/src ]; then
    curl -O http://download.redis.io/redis-stable.tar.gz
    tar xvzf redis-stable.tar.gz
    rm redis-stable.tar.gz
fi
make
redis-stable/src/redis-server &
celery worker -A app.celery --loglevel=info &
python app.py
