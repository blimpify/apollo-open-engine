# Apollo Open Engine

Work in Progress alternative to the commercial available apollo-engine based on the same protocol. 

```js
const apolloServer = new ApolloServer({
    ...
    engine: {
      endpointUrl: 'http://localhost:8000',
      apiKey: 'fake:key', // currently doesent matter
      sendReportsImmediately: true // helps with debugging
    },
    ...
  });
```

## Install

```bash
npm install
```

## Start

Guide how to run Apollo Open Engine

### Options

```bash
# Available 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'.
LOG_LEVEL=trace
```

```bash
npm start
```

# Test

```bash
npm test
```