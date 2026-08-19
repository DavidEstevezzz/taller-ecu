FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

# npm ci exige un lockfile coherente: instalación reproducible.
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Después del build: activa la cookie de sesión Secure y evita que un
# npm posterior arrastre dependencias de desarrollo.
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
