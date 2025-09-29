FROM node:22

# Install basic development tools
RUN apt update && apt install -y git

# Clone Quartz repository
RUN git clone https://github.com/jackyzha0/quartz.git /quartz

# Set working directory
WORKDIR /quartz

# Install Quartz dependencies
RUN npm install

# Expose the port that Quartz dev server uses
EXPOSE 8080
