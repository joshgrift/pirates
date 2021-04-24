FROM node:14

COPY . .

RUN cd client && npm install
RUN cd client && npm run build:production

RUN cd server && npm install
RUN cd server && npm run build:production

EXPOSE 8081
CMD [ "node", "server/dist/server/index.js" ]
