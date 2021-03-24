import fs from 'fs';
import yaml from 'yaml';
import deepmerge from 'deepmerge';

interface Config {
  web3: {
    provider: string;
  };
  contracts: {
    hello: {
      abiPath: string;
      binPath: string;
    };
  };
  accounts: { name: string; keyPath: string; password: string }[];
}

const loadConfig = (configPaths: string[]): Config => {
  const configs = [];
  for (const configPath of configPaths) {
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config = yaml.parse(configData);
    configs.push(config);
  }
  const arrayMerge = <K>(_target: unknown, source: K) => source;
  return deepmerge.all<Config>(configs, { arrayMerge });
};

export { Config, loadConfig };
