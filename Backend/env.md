APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://72.60.173.25

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

PHP_CLI_SERVER_WORKERS=4
BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# =======================
# 📦 DATABASE CONNECTION
# =======================
DB_CONNECTION=mysql
DB_HOST=72.60.173.25
DB_PORT=3306
DB_DATABASE=sistema_rrhh
DB_USERNAME=jordy_user
DB_PASSWORD=ClaveJordy123*

# =======================
# ⚙️ SESSION & CACHE
# =======================
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

CACHE_STORE=database
QUEUE_CONNECTION=database

# =======================
# 📨 MAIL (DESARROLLO)
# =======================
MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="noreply@72.60.173.25"
MAIL_FROM_NAME="${APP_NAME}"

# =======================
# 🌍 REDIS / MEMCACHED
# =======================
MEMCACHED_HOST=127.0.0.1
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# =======================
# ☁️ AWS (sin usar)
# =======================
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# =======================
# ⚛️ FRONTEND (VITE)
# =======================
VITE_APP_NAME="${APP_NAME}"
VITE_API_URL="http://72.60.173.25/api"
