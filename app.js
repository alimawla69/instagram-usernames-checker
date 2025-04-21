require('colors');
const axios = require('axios'),
  fs = require('fs'),
  randomUseragent = require('random-useragent'),
  cheerio = require('cheerio'),
  readline = require('readline'),
  generatedUsernames = new Set();

function fileExists(filename) {
  try {
    fs.accessSync(filename, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function getUsername(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789._';
  let username = '';

  do {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      username += characters[randomIndex];
    }
  } while (generatedUsernames.has(username) || blockedUsernames.has(username));

  generatedUsernames.add(username);
  return username;
}
if (!fileExists('proxies.txt')) {
  try {
    console.log('the proxies.txt is not exits!\nto make this method work you need good proxies or this method will not work.'.red);
    console.log('Proxies file created successfully!'.green);
    fs.writeFileSync('proxies.txt', ''); // Use writeFileSync for simplicity in this case
  } catch (error) {
    console.error('the JavaScript does not have access to create files, so please create proxies.txt and add some proxies'.red);
  }
  return;
}
if (!fileExists('hits.txt')) {
  try {
    console.log('the hits.txt is not exits!\nto make this method work you need good proxies or this method will not work.'.red);
    console.log('hits.txt file created successfully!'.green);
    fs.writeFileSync('hits.txt', ''); // Use writeFileSync for simplicity in this case
  } catch (error) {
    console.error('the JavaScript does not have access to create files, so please create hits.txt'.red);
  }
  return;
}
if (!fileExists('taken.txt')) {
  try {
    console.log('the taken.txt is not exits!\nto make this method work you need good proxies or this method will not work.'.red);
    console.log('taken.txt file created successfully!'.green);
    fs.writeFileSync('taken.txt', ''); // Use writeFileSync for simplicity in this case
  } catch (error) {
    console.error('the JavaScript does not have access to create files, so please create taken.txt'.red);
  }
  return;
}

let proxies = fs.readFileSync('proxies.txt', 'utf-8').trim().replace(/\r/gi, '').split('\n');
if (!proxies || !proxies[0]) return console.log('proxies file is empty!!!!!!!\nproxies are required for this method to work; please add some or this method will not work'.red);

const blockedUsernames = new Set();
if (fileExists('taken.txt')) {
  const blockedUsernamesList = fs.readFileSync('taken.txt', 'utf-8').trim().replace(/\r/gi, '').split('\n');
  blockedUsernamesList.forEach(username => blockedUsernames.add(username));
}

async function Check(username, num, proxy) {
  if (blockedUsernames.has(username)) {
    console.log(`Thread ${num} - Username (${username}) is arleady taken. Skipping.`.yellow);
    return;
  }

  try {
    let requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': randomUseragent.getRandom()
      }
    };
    if (proxy.username && proxy.password) {
      requestConfig.proxy = {
        protocol: 'http',
        host: proxy.host,
        port: proxy.port,
        auth: {
          username: proxy.username,
          password: proxy.password
        }
      };
    } else {
      requestConfig.proxy = {
        protocol: 'http',
        host: proxy.host,
        port: proxy.port,
      };
    }
    const response = await axios.get('https://www.instagram.com/' + username);
    const $ = cheerio.load(response.data);
    const title = $('title').text();

    if (title.includes(`@${username}`)) {
      console.log(`Thread ${num} - Username (${username}) Is Not Available`.red);
      fs.appendFileSync('taken.txt', username + '\n');
    } else if (title === "Instagram") {
      console.log(`Thread ${num} - Username (${username}) Is Available`.green);
      fs.appendFileSync('hits.txt', username + '\n');
    } else if (title.includes("Login")) {
      console.log(`Thread ${num} - Username (${username}) Is UNAvailable or Banded!`.green);
      fs.appendFileSync('taken.txt', username + '\n');
    } else {
      console.log(`Thread ${num} - Username (${username}) Is UNAvailable or Banded!`.green);
      fs.appendFileSync('taken.txt', username + '\n');
    }

  } catch (error) {
    console.error(`Thread ${num} - Username ${username} - Error: ${error.message.includes('429') ? "The resource is being rate limited." : error}`);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

(async () => {
  console.clear()
  console.log('---------------------------------------'.red)
  console.log(`This tool has been made by Ali Mawla Know as _Luffy99 -> (https://discord.gg/HFZRWUC) - (https://github.com/alimawla69/discord-username-checker) `)
  console.log('---------------------------------------'.red)
  console.log('')
  const usernameLength = await getInput('Enter username length (2 to 20, default is 4): ');
  const numThreads = await getInput('Enter number of threads (default is 100): ');
  rl.close();

  const parsedUsernameLength = Math.max(4, Math.min(parseInt(usernameLength, 10) || 4
    , 20));
  const parsedNumThreads = parseInt(numThreads, 10) || 100;

  const timeout = 0;
  let currentProxy = 0;

  for (let num = 1; num <= parsedNumThreads; num++) {
    const usrname = getUsername(parsedUsernameLength);

    const proxyInfo = proxies[currentProxy];
    const [host, port, username, password] = proxyInfo ? proxyInfo.split(':') : [null, null, null, null];

    const proxyConfig = host
      ? {
        host,
        port,
        ...(username && password ? { username: `${username}`, password: `${password}` } : {}),
      }
      : null;

    Check(usrname, num, proxyConfig);

    currentProxy = (currentProxy + 1) % proxies.length;

    if (num < parsedNumThreads) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }
})();
