FROM nginx:1.21.6-alpine

ENV BACKEND_URL="http://localhost:3000/graphql"
ENV PORT=80

COPY nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY nginx/headers.conf /etc/nginx/headers.conf

COPY build /usr/share/nginx/html

CMD envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx