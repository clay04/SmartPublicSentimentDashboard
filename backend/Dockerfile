FROM node:20-alpine

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm install

# copy source code
COPY . .

# expose port
EXPOSE 3000

# run app
CMD ["npm", "run", "dev"]