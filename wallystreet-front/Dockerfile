FROM node:20-alpine

WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 5173

# Forzar a Vite a exponer el host para que sea accesible desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]