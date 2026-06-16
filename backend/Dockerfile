FROM node:20

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm install

# copy source code
COPY . .

RUN npx prisma generate

# expose port
EXPOSE 3000

# run app
CMD ["npm", "run", "start"]