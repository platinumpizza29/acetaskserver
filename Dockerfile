# Use the official Node.js image as the base image
FROM node:22-alpine 

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the Prisma Client
RUN npx prisma generate

# migrate the database
RUN npx prisma migrate

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
