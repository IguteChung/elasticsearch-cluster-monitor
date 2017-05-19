FROM mhart/alpine-node:6
RUN apk add --update --no-cache libc6-compat python alpine-sdk && \
    python -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip install --upgrade pip setuptools && \
    rm -rf /var/cache/apk/* /tmp/* && \
    rm -r /root/.cache

WORKDIR /app/
COPY package.json /app/
RUN npm install
COPY . /app/

CMD [ "npm", "start" ]
