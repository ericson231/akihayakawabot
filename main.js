const https = require('https');

// const pingUrl = "https://google.com";

// let totalMinutes = 0;

function keepAlive() {
  // setInterval(() => {
  //     https.get(pingUrl, (response) => {
  //         if (response.statusCode === 200) {
  //             totalMinutes++;
  //             const days = Math.floor(totalMinutes / 1440); // 1440 minutes in a day
  //             const hours = Math.floor((totalMinutes % 1440) / 60); // Remaining minutes converted to hours
  //             const minutes = totalMinutes % 60; // Remaining minutes

  //             const daysText = days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : '';
  //             const hoursText = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '';
  //             const minutesText = minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : '';

  //             const uptimeText = daysText + (daysText && (hoursText || minutesText) ? ', ' : '') + hoursText + (hoursText && minutesText ? ', ' : '') + minutesText;

  //             console.log(`UPTIME STATUS: ${uptimeText}`);
  //         } else {
  //             console.log(`Received ${response.statusCode} status code. Check your application.`);
  //         }
  //     }).on('error', (error) => {
  //         console.error(`An error occurred: ${error.message}`);
  //     });
  // }, 60000); // Send a request every 1 minute
    setInterval(() => {
      const uptime = Date.now() - global.client.timeStart;
      const totalMinutes = Math.floor(uptime / 60000);
      const days = Math.floor(totalMinutes / 1440); // 1440 minutes in a day
      const hours = Math.floor((totalMinutes % 1440) / 60); // Remaining minutes converted to hours
      const minutes = totalMinutes % 60; // Remaining minutes

      const daysText = days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : '';
      const hoursText = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '';
      const minutesText = minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : '';

      const uptimeText = daysText + (daysText && (hoursText || minutesText) ? ', ' : '') + hoursText + (hoursText && minutesText ? ', ' : '') + minutesText;

      console.log(`UPTIME STATUS: ${uptimeText}`);
    }, 60000); // Update every minute
}

// Main application logic here
const { readdirSync, readFileSync, writeFileSync } = require("fs-extra");
const { join, resolve } = require('path')
const { execSync } = require('child_process');
const config = require("./config.json");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const fs = require("fs");
const login = require('./includes/login');
const moment = require("moment-timezone");
const logger = require("./utils/log.js");

global.client = new Object({
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  eventRegistered: new Array(),
  handleSchedule: new Array(),
  handleReaction: new Array(),
  handleReply: new Array(),
  mainPath: process.cwd(),
  configPath: new String(),
  getTime: function(option) {
    switch (option) {
      case "seconds":
        return `${moment.tz("Asia/Manila").format("ss")}`;
      case "minutes":
        return `${moment.tz("Asia/Manila").format("mm")}`;
      case "hours":
        return `${moment.tz("Asia/Manila").format("HH")}`;
      case "date":
        return `${moment.tz("Asia/Manila").format("DD")}`;
      case "month":
        return `${moment.tz("Asia/Manila").format("MM")}`;
      case "year":
        return `${moment.tz("Asia/Manila").format("YYYY")}`;
      case "fullHour":
        return `${moment.tz("Asia/Manila").format("HH:mm:ss")}`;
      case "fullYear":
        return `${moment.tz("Asia/Manila").format("DD/MM/YYYY")}`;
      case "fullTime":
        return `${moment.tz("Asia/Manila").format("HH:mm:ss DD/MM/YYYY")}`;
    }
  },
  timeStart: Date.now()
});

global.data = new Object({
  threadInfo: new Map(),
  threadData: new Map(),
  userName: new Map(),
  userBanned: new Map(),
  threadBanned: new Map(),
  commandBanned: new Map(),
  threadAllowNSFW: new Array(),
  allUserID: new Array(),
  allCurrenciesID: new Array(),
  allThreadID: new Array()
});

global.utils = require("./utils");
global.loading = require("./utils/log");
global.nodemodule = new Object();
global.config = new Object();
global.configModule = new Object();
global.moduleData = new Array();
global.language = new Object();
global.account = new Object();

const errorMessages = [];
if (errorMessages.length > 0) {
  console.log("Commands with errors:");
  errorMessages.forEach(({ command, error }) => {
    console.log(`${command}: ${error}`);
  });
}

var configValue;
try {
  global.client.configPath = join(global.client.mainPath, "config.json");
  configValue = require(global.client.configPath);
  logger.loader("Found config.json file!");
} catch (e) {
  return logger.loader('"config.json" file not found."', "error");
}

try {
  for (const key in configValue) global.config[key] = configValue[key];
  logger.loader("Config Loaded!");
} catch (e) {
  return logger.loader("Can't load file config!", "error")
}

for (const property in listPackage) {
  try {
    global.nodemodule[property] = require(property)
  } catch (e) { }
}
const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, {
  encoding: 'utf-8'
})).split(/\r?\n|\r/);
const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
for (const item of langData) {
  const getSeparator = item.indexOf('=');
  const itemKey = item.slice(0, getSeparator);
  const itemValue = item.slice(getSeparator + 1, item.length);
  const head = itemKey.slice(0, itemKey.indexOf('.'));
  const key = itemKey.replace(head + '.', '');
  const value = itemValue.replace(/\\n/gi, '\n');
  if (typeof global.language[head] == "undefined") global.language[head] = new Object();
  global.language[head][key] = value;
}

global.getText = function(...args) {
  const langText = global.language;
  if (!langText.hasOwnProperty(args[0])) {
    throw new Error(`${__filename} - Not found key language: ${args[0]}`);
  }
  var text = langText[args[0]][args[1]];
  if (typeof text === 'undefined') {
    throw new Error(`${__filename} - Not found key text: ${args[1]}`);
  }
  for (var i = args.length - 1; i > 0; i--) {
    const regEx = RegExp(`%${i}`, 'g');
    text = text.replace(regEx, args[i + 1]);
  }
  return text;
};

try {
  var appStateFile = resolve(join(global.client.mainPath, config.APPSTATEPATH || "appstate.json"));
  var appState = ((process.env.REPL_OWNER || process.env.PROCESSOR_IDENTIFIER) && (fs.readFileSync(appStateFile, 'utf8'))[0] != "[" && config.encryptSt) ? JSON.parse(global.utils.decryptState(fs.readFileSync(appStateFile, 'utf8'), (process.env.REPL_OWNER || process.env.PROCESSOR_IDENTIFIER))) : require(appStateFile);
  logger.loader("Found the bot's appstate.")
} catch (e) {
  return logger.loader("Can't find the bot's appstate.", "error")
}

function onBot() {
  const loginData = {};
  loginData.appState = appState;
  login(loginData, async (loginError, loginApiData) => {
    if (loginError) {
      if (loginError.error == 'Error retrieving userID. This can be caused by a lot of things, including getting blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify.') {
        console.log(loginError.error)
        process.exit(0)
      } else {
        console.log(loginError)
        return process.exit(0)
      }
    }

    const fbstate = loginApiData.getAppState();
    loginApiData.setOptions(global.config.FCAOption);
    let d = loginApiData.getAppState();
    d = JSON.stringify(d, null, '\x09');
    if ((process.env.REPL_OWNER || process.env.PROCESSOR_IDENTIFIER) && global.config.encryptSt) {
      d = await global.utils.encryptState(d, process.env.REPL_OWNER || process.env.PROCESSOR_IDENTIFIER);
      writeFileSync(appStateFile, d)
    } else {
      writeFileSync(appStateFile, d)
    }
    global.account.cookie = fbstate.map(i => i = i.key + "=" + i.value).join(";");
    global.client.api = loginApiData
    global.config.version = config.version,
      (async () => {
        const commandsPath = `${global.client.mainPath}/modules/commands`;
        const listCommand = readdirSync(commandsPath).filter(command => command.endsWith('.js') && !command.includes('example') && !global.config.commandDisabled.includes(command));
        console.log(`\n` + `──LOADING COMMANDS─●`);
        for (const command of listCommand) {
          try {
            const module = require(`${commandsPath}/${command}`);
            const { config } = module;

            if (!config?.name) {
              try {
                throw new Error(`[ COMMAND ] ${command} command has no name property or empty!`);
              } catch (error) {
                console.log(error.message);
                continue;
              }
            }
            if (!config?.commandCategory) {
              try {
                throw new Error(`[ COMMAND ] ${command} commandCategory is empty!`);
              } catch (error) {
                console.log(error.message);
                continue;
              }
            }

            if (!config?.hasOwnProperty('usePrefix')) {
              console.log(`Command`, command + ` does not have the "usePrefix" property.`);
              continue;
            }

            if (global.client.commands.has(config.name || '')) {
              console.log(`[ COMMAND ] ${command} Module is already loaded!`);
              continue;
            }
            const { dependencies, envConfig } = config;
            if (dependencies) {
              Object.entries(dependencies).forEach(([reqDependency, dependencyVersion]) => {
                if (listPackage[reqDependency]) return;
                try {
                  execSync(`npm --package-lock false --save install ${reqDependency}${dependencyVersion ? `@${dependencyVersion}` : ''}`, {
                    stdio: 'inherit',
                    env: process.env,
                    shell: true,
                    cwd: join(__dirname, 'node_modules')
                  });
                  require.cache = {};
                } catch (error) {
                  const errorMessage = `[PACKAGE] Failed to install package ${reqDependency} for module`;
                  console.error(errorMessage);
                }
              });
            }

            if (envConfig) {
              const moduleName = config.name;
              global.configModule[moduleName] = global.configModule[moduleName] || {};
              global.config[moduleName] = global.config[moduleName] || {};
              for (const envConfigKey in envConfig) {
                global.configModule[moduleName][envConfigKey] = global.config[moduleName][envConfigKey] ?? envConfig[envConfigKey];
                global.config[moduleName][envConfigKey] = global.config[moduleName][envConfigKey] ?? envConfig[envConfigKey];
              }
              var configPath = require('./config.json');
              configPath[moduleName] = envConfig;
              writeFileSync(global.client.configPath, JSON.stringify(configPath, null, 4), 'utf-8');
            }


            if (module.onLoad) {
              const moduleData = {
                api: loginApiData
              };
              try {
                module.onLoad(moduleData);
              } catch (error) {
                const errorMessage = "Unable to load the onLoad function of the module."
                throw new Error(errorMessage, 'error');
              }
            }

            if (module.handleEvent) global.client.eventRegistered.push(config.name);
            global.client.commands.set(config.name, module);
            try {
              console.log(`LOADED ${config.name} success`);
            } catch (err) {
              console.error("An error occurred while loading the command:", err);
            }

            console.err
          } catch (error) {
            console.error(`ERROR! ${command} failed with error: ${error.message}` + `\n`, "COMMAND");
          }
        }
      })(),

      (async () => {
        const events = readdirSync(join(global.client.mainPath, 'modules/events')).filter(ev => ev.endsWith('.js') && !global.config.eventDisabled.includes(ev));
        console.log(`\n` + `──LOADING EVENTS─●`);
        for (const ev of events) {
          try {
            const event = require(join(global.client.mainPath, 'modules/events', ev));
            const { config, onLoad, run } = event;
            if (!config || !config.name || !run) {
              console.error(`ERROR! ${ev} Module is not in the correct format. `);
              continue;
            }


            if (errorMessages.length > 0) {
              console.log("Commands with errors:");
              errorMessages.forEach(({ command, error }) => {
                console.log(`${command}: ${error}`);
              });
            }

            if (global.client.events.has(config.name)) {
              console.error(`ERROR! ${ev} Module is already loaded!`);
              continue;
            }
            if (config.dependencies) {
              const missingDeps = Object.keys(config.dependencies).filter(dep => !global.nodemodule[dep]);
              if (missingDeps.length) {
                const depsToInstall = missingDeps.map(dep => `${dep}${config.dependencies[dep] ? '@' + config.dependencies[dep] : ''}`).join(' ');
                execSync(`npm install --no-package-lock --no-save ${depsToInstall}`, {
                  stdio: 'inherit',
                  env: process.env,
                  shell: true,
                  cwd: join(__dirname, 'node_modules')
                });
                Object.keys(require.cache).forEach(key => delete require.cache[key]);
              }
            }
            if (config.envConfig) {
              const configModule = global.configModule[config.name] || (global.configModule[config.name] = {});
              const configData = global.config[config.name] || (global.config[config.name] = {});
              for (const evt in config.envConfig) {
                configModule[evt] = configData[evt] = config.envConfig[evt] || '';
              }
              writeFileSync(global.client.configPath, JSON.stringify({
                ...require(global.client.configPath),
                [config.name]: config.envConfig
              }, null, 2));
            }
            if (onLoad) {
              const eventData = {
                api: loginApiData
              };
              await onLoad(eventData);
            }
            global.client.events.set(config.name, event);
            console.log(`[ EVENT ] LOADED ${config.name} success`);
          }
          catch (err) {
            console.error(`ERROR! ${cb(ev)} failed with error: ${err.message}` + `\n`, "EVENT");
          }
        }
      })();
    console.log(`\n` + `──BOT START─● `);
    console.log(`[ SUCCESS ] Loaded ${`${global.client.commands.size}`} commands and ${`${global.client.events.size}`} events successfully`);
    console.log(`[ TIMESTART ] Launch time: ${((Date.now() - global.client.timeStart) / 1000).toFixed()}s`);
    const listener = require('./includes/listen')({ api: loginApiData });
    global.custom = require('./custom')({ api: loginApiData });
    global.handleListen = loginApiData.listenMqtt(async (error, message) => {
      if (error) {
        if (error.error === 'Not logged in.') {
          console.log("Your bot account has been logged out!");
          return process.exit(1);
        }
        if (error.error === 'Not logged in') {
          console.log("Your account has been checkpointed, please confirm your account and log in again!");
          return process.exit(0);
        }
        console.log(error);
        return process.exit(0);
      }
      if (['presence', 'typ', 'read_receipt'].some(data => data === message.type)) return;
      return listener(message);
    });
  });
}
(async () => {
  try {
    console.log(`\n` + `──DATABASE─●`);
    console.log(`[ CONNECT ] Connected to JSON database successfully!`);
    console.log(`\n` + `──LOADING COMMANDS─●`);
    console.log(`LOADED commands and events successfully`);
    console.log(`[ TIMESTART ] Launch time: ${((Date.now() - global.client.timeStart) / 1000).toFixed()}s`);
    onBot();
  } catch (error) {
    console.error(`[ CONNECT ] Failed to connect to the JSON database.`);
  }
})();
// Call the keepAlive function to start the keep-alive process
keepAlive();
