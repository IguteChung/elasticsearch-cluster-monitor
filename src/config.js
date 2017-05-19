import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const esHost = () => {
  const host = argv['es-host'];
  return host || 'http://localhost:9200';
};

module.exports = esHost;
