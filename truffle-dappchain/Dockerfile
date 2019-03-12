FROM node:10

RUN yarn global add truffle

WORKDIR /home/node/app
RUN chown -R node:node /home/node/app

COPY ./package.json $HOME/home/node/app/package.json
COPY ./yarn.lock $HOME/home/node/app/yarn.lock

RUN yarn

COPY . $HOME/home/node/app/

USER node

CMD [ "yarn", "deploy" ]





