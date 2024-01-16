# Use a imagem oficial do Node.js como base
FROM node:alpine

# Defina o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copie os arquivos de configuração do aplicativo (package.json e yarn.lock)
COPY package.json yarn.lock ./

# Instale as dependências do aplicativo
RUN yarn install

# Instale o pacote rimraf globalmente
RUN yarn global add rimraf

# Copie todos os arquivos do aplicativo para o contêiner
COPY . .

# Execute o comando yarn start para iniciar a aplicação
CMD ["yarn", "start"]
