FROM php:8.4.27-apache

# Install PostgreSQL PDO extension
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY ./public /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Version for /status: Easypanel passes the commit being built as the GIT_SHA build argument.
ARG GIT_SHA=""
RUN mkdir -p /srv && printf '%s\n' "${GIT_SHA:-unknown}" > /srv/git-sha

EXPOSE 80
