FROM nginx:1.21.6-alpine

ENV PORT=80

COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY nginx/headers.conf /etc/nginx/headers.conf

COPY build /usr/share/nginx/html

RUN envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
