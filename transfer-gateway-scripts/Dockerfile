FROM node:10

RUN mkdir -p /home/node/app
RUN chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./package.json $HOME/home/node/app/package.json
RUN yarn

COPY ./ $HOME/home/node/app

USER node

CMD [ "yarn", "map"]

