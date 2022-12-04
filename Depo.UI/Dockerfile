#########################
### build environment ###
#########################

# base image
FROM node:9.6.1 as builder


# set working directory
RUN mkdir /usr/src/app
RUN mkdir /usr/src/config
WORKDIR /usr/src/app

COPY nginx.conf /usr/src/config/nginx.conf

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
RUN npm install

RUN npm remove @angular/cli
RUN npm install @angular/cli@6.1.5 --unsafe

RUN npm remove moment-timezone
RUN npm install moment-timezone@0.5.13 --force

RUN npm remove rxjs
RUN npm install rxjs@6.2.2 --unsafe

RUN npm remove @angular-devkit/build-angular
RUN npm install @angular-devkit/build-angular@0.7.5 --unsafe

RUN npm remove node-sass
RUN npm install node-sass@4.14.1 --unsafe
RUN npm rebuild node-sass


# add app
COPY . /usr/src/app


# generate build
RUN npm run build-prod 

##################
### production ###
##################

# base image
FROM nginx:1.13.9-alpine

# copy artifact build from the 'build environment'
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

COPY --from=builder /usr/src/config/nginx.conf /etc/nginx/nginx.conf

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]
