FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
COPY app app
COPY bootstrap bootstrap
COPY config config
COPY database database
COPY routes routes
COPY artisan artisan

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

FROM node:22-bookworm AS assets

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY --from=vendor /app/vendor vendor
COPY resources resources
COPY public public
COPY vite.config.js postcss.config.js tailwind.config.js ./

RUN npm run build

FROM php:8.2-apache AS runtime

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends libzip-dev unzip \
    && docker-php-ext-install pdo_mysql pdo_sqlite zip \
    && a2enmod rewrite headers \
    && sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf \
    && rm -rf /var/lib/apt/lists/*

COPY --from=vendor /app/vendor vendor
COPY --from=assets /app/public/build public/build
COPY . .
COPY docker/entrypoint.sh /usr/local/bin/naminiel-entrypoint

RUN chmod +x /usr/local/bin/naminiel-entrypoint \
    && mkdir -p /data storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs storage/app/public bootstrap/cache \
    && chown -R www-data:www-data /data storage bootstrap/cache

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/data/database.sqlite \
    SESSION_DRIVER=file \
    CACHE_DRIVER=file \
    QUEUE_CONNECTION=sync

ENTRYPOINT ["naminiel-entrypoint"]
CMD ["apache2-foreground"]
