FROM node:8.11.1

# Create app directory
WORKDIR /build

# Install app dependancies
# A wildcard is used to ensure both the package and package-lock are copied
COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

# Expose app port
EXPOSE 9090

# start server
CMD ["npm","start"]
