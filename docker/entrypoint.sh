#!/usr/bin/env sh
set -eu

mkdir -p /data /var/www/html/storage/framework/cache/data /var/www/html/storage/framework/sessions /var/www/html/storage/framework/views /var/www/html/storage/logs /var/www/html/storage/app/public

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    touch "${DB_DATABASE:-/data/database.sqlite}"
fi

chown -R www-data:www-data /data /var/www/html/storage /var/www/html/bootstrap/cache

if [ -n "${APP_KEY:-}" ]; then
    php artisan config:cache
fi

php artisan migrate --force
php artisan storage:link || true

exec "$@"
