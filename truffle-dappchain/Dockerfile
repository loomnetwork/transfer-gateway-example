FROM node:10

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./* $HOME/home/node/app/

USER node

RUN yarn global add truffle
RUN yarn

ENTRYPOINT [ "yarn", "deploy" ]





