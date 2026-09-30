# Gedeelde basis: dependencies installeren
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Development: Vite dev server met hot reload (broncode wordt gemount)
FROM base AS dev
EXPOSE 5173
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]

# Build: Supabase-waarden uit .env worden hier in de bundle gebakken
FROM base AS build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
COPY . .
RUN npm run build

# Productie (standaard target): statische bestanden via nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
