let jsonVariable;

const resolveKey = (keys, obj) => {
  if (keys.length === 1) {
    return obj[keys[0]];
  }

  const nested = obj[keys[0]];
  return resolveKey(keys.slice(1), nested);
}

const reolveJsonVarialbe = (key) => {
  if (jsonVariable) {
    const v = resolveKey(key.trim().split('.'), jsonVariable);
    if (v === undefined) {
      return `:fire: \${ ${key} } not found in json file :fire:`
    }

    if (typeof v === 'object') {
      return `:fire: The value of \${ ${key} } in json file is object :fire:`
    }

    return v;
  } else {
    return key;
  }
}

const getJson = (fileName) => {
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET", `${fileName}.json`, false);
  xhttp.send(null);
  return JSON.parse(xhttp.response);
}

const installJsonVariablePlugin = (hook, vm) => {
  if (!vm.config.jsonVariableFile && (!vm.config.jsonVariableFiles || vm.config.jsonVariableFiles.length === 0)) { 
    console.error('Please specify either jsonVariableFile or jsonVariableFiles');
    return;
  }

  if (vm.config.jsonVariableFile && (vm.config.jsonVariableFiles && vm.config.jsonVariableFiles.length > 0)) {
    console.error('You can specify either jsonVariableFile or jsonVariableFiles');
    return;
  }

  hook.init(() => {
    if (vm.config.jsonVariableFile) {
      try {
        jsonVariable = getJson(vm.config.jsonVariableFile)
      } catch (e) {
        console.error(`Failed to fetch ${jsonVariableFile}.json.`, e);
      }
      return;
    }

    if (vm.config.jsonVariableFiles) {
      jsonVariable = vm.config.jsonVariableFiles.reduce((acc, f) => {
        try {
          acc[f.prefix] = getJson(f.file);
        } catch (e) {
          console.error(`Failed to load ${f.file}.json`, e);
        }
        return acc;
      }, {});
    }
  });

  hook.beforeEach((content) => {
    return content.replace(/\$\[{([^\}]*)}\]/g, (a, b) => reolveJsonVarialbe(b));
  });
}

if (!window.$docsify) {
  window.$docsify = {};
}

window.$docsify.plugins = (window.$docsify.plugins || []).concat(installJsonVariablePlugin);