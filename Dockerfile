FROM php:8.4.27-apache

# Install PostgreSQL PDO extension, and GD (with FreeType + JPEG) plus the
# DejaVu font for the /api/preview share image
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libpng-dev libfreetype6-dev libjpeg62-turbo-dev \
    fonts-dejavu-core \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql pgsql gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Production PHP settings (errors logged, not shown) and no PHP version header
RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && printf 'expose_php = Off\n' > "$PHP_INI_DIR/conf.d/zz-security.ini"

# Enable Apache mod_rewrite and mod_headers (the .htaccess security headers need it),
# and hide the Apache version
RUN a2enmod rewrite headers \
    && printf 'ServerTokens Prod\nServerSignature Off\n' > /etc/apache2/conf-available/zz-security.conf \
    && a2enconf zz-security

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY ./public /var/www/html

# Set permissions (cache/previews sits outside the web root, for /api/preview)
RUN mkdir -p /var/www/cache/previews \
    && chown -R www-data:www-data /var/www/html /var/www/cache

# Version for /status: Easypanel passes the commit being built as the GIT_SHA build argument.
ARG GIT_SHA=""
RUN mkdir -p /srv && printf '%s\n' "${GIT_SHA:-unknown}" > /srv/git-sha

EXPOSE 80
