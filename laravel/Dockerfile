FROM php:8.2-cli AS vendor

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends git libsqlite3-dev libzip-dev unzip \
    && docker-php-ext-install pdo_mysql pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

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

ARG SOURCE_COMMIT=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.revision="${SOURCE_COMMIT}" \
    org.opencontainers.image.created="${BUILD_DATE}"

RUN apt-get update \
    && apt-get install -y --no-install-recommends libsqlite3-dev libzip-dev unzip \
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
    && printf '{"source_commit":"%s","build_date":"%s"}\n' "${SOURCE_COMMIT}" "${BUILD_DATE}" > public/build-info.json \
    && chown -R www-data:www-data /data storage bootstrap/cache public/build-info.json

ENV APP_ENV=production \
    APP_DEBUG=false \
    SOURCE_COMMIT="${SOURCE_COMMIT}" \
    BUILD_DATE="${BUILD_DATE}" \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/data/database.sqlite \
    SESSION_DRIVER=file \
    CACHE_DRIVER=file \
    QUEUE_CONNECTION=sync

ENTRYPOINT ["naminiel-entrypoint"]
CMD ["apache2-foreground"]
