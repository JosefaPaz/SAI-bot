require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client({
  ws: { intents: Discord.Intents.NON_PRIVILEGED },
});

const { google } = require('googleapis');
// const { type } = require('os');
// const { request } = require('http');
const keys = require('./google-credentials.json');

const prefix = process.env.PREFIX;
const token = process.env.TOKEN;
const clientEmail = process.env.CLIENT_EMAIL;
const privateKey = process.env.PRIVATE_KEY;
const clientSheet = process.env.SPREADSHEET_ID;

let lastRow = null;
async function gsCountRows(infoClient) {
  const gsapi = google.sheets({ version: 'v4', auth: infoClient });

  const readOptions = {
    spreadsheetId: clientSheet,
    range: 'Ayudas [BOT]!A1!A1:A100000000',
  };

  const res = await gsapi.spreadsheets.values.get(readOptions);
  console.log(`--- Answer gsCountRows: ${res.data.values.length}`);
  console.log(`--- Type of gsCountRows: ${typeof res.data.values.length}`);
  lastRow = res.data.values.length + 1;
}

const client2 = new google.auth.JWT(keys.clientEmail, null, keys.privateKey, [
  'https://www.googleapis.com/auth/spreadsheets',
]);

// const roleSections = {
//   '875812774847074354': 1,
//   '875775363714797658': 2,
//   '875775363706417171': 3,
//   '875775363706417170': 4,
//   '875775363706417169': 5,
//   '875775363706417168': 6,
//   '875775363706417167': 7,
//   '875775363706417166': 8,
//   '875775363706417165': 9,
//   '875775363706417164': 10,
// };

// async function getSection(message) {
//   let section = 0;
//   const memberRoles = [...message.member.roles.cache.keys()];
//   memberRoles.forEach((rolId) => {
//     if (rolId in roleSections) {
//       section = roleSections[rolId];
//     }
//   });
//   return section;
// }

async function getDataTime() {
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Domingo',
  ];
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const d = new Date();

  const time = `${d.getHours().toString()}:${d.getMinutes().toString()}:${d
    .getSeconds()
    .toString()}`;
  return [days[d.getDay()], `${d.getDate()} ${months[d.getMonth()]}`, time];
}

function countInstances(string, word) {
  return string.split(word).length - 1;
}

async function gsWriteAssistanceTA(infoClient, data) {
  const gsapi = google.sheets({ version: 'v4', auth: infoClient });

  const appendOptions = {
    spreadsheetId: clientSheet,
    range: 'Asistencia Ayudantes [BOT]!A1',
    valueInputOption: 'USER_ENTERED',
    resource: { values: data },
  };

  const res = await gsapi.spreadsheets.values.append(appendOptions);
  console.log(`--- Answer gsWriteAssistanceTA: ${res}`);
}

async function gsWriteAssistanceStudent(infoClient, data) {
  const gsapi = google.sheets({ version: 'v4', auth: infoClient });

  const appendOptions = {
    spreadsheetId: clientSheet,
    range: 'Asistencia Estudiantes [BOT]!A1',
    valueInputOption: 'USER_ENTERED',
    resource: { values: data },
  };

  const res = await gsapi.spreadsheets.values.append(appendOptions);
  console.log(`--- Answer gsWriteAssistanceStudent: ${res}`);
}

async function gsWriteHelp(infoClient, data) {
  const gsapi = google.sheets({ version: 'v4', auth: infoClient });

  const appendOptions = {
    spreadsheetId: clientSheet,
    range: 'Ayudas [BOT]!A1',
    valueInputOption: 'USER_ENTERED',
    resource: { values: data },
  };

  const res = await gsapi.spreadsheets.values.append(appendOptions);
  console.log(`--- Answer gsWriteAssistanceStudent: ${res}`);
  await gsCountRows(infoClient);
}

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  // eslint-disable-next-line import/no-dynamic-require
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

client.once('ready', async () => {
  console.log('SAI-bot is online!');
  // await gsCountRows(client2);
});

client.on('guildMemberAdd', (member) => {
  member
    .send(
      `Bienvenido al servidor, ${member.username}! Recuerda leer las reglas para poder usar el servidor`,
    )
    .then((sentEmbed) => {
      sentEmbed.react('👍');
    });
});


client.on('message', async (message) => {
  // EXIT IF MESSAGE IS FROM BOT OR DO NOT HAVE THE PREFIX
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // // ASSISTANCE OF STUDENTS
  // if (message.channel.id === '813180432682188810') {
  //   const d = new Date();
  //   const hour = d.getHours();
  //   const minutes = d.getMinutes();
  //   console.log(`--- New message in dudas personales at ${hour} ---`);
  //   if (!(hour >= 15 && hour <= 18) && !message.author.bot) {
  //     message.reply(
  //       '¡La SAV funciona de Lunes a Viernes de 15:30 a 18:20! Vuelva pronto :clock3: :snail:',
  //     );
  //   }
  //   if (!message.author.bot) {
  //     if (
  //       (hour >= 15 && hour <= 18)
  //       || (hour === 15 && minutes >= 30)
  //       || (hour === 18 && minutes <= 20)
  //     ) {
  //       if (
  //         message.member.roles.cache.some((role) => role.name === 'Alumnos')
  //       ) {
  //         console.log(
  //           `--- Writing student assistance for ${message.author.username} ----`,
  //         );
  //         // const section = getSection(message);
  //         const dataTime = getDataTime();

  //         client2.authorize((err) => { // tokens
  //           if (err) {
  //             console.log(err);
  //           } else {
  //             return gsWriteAssistanceStudent(client2, [
  //               [
  //                 message.author.username,
  //                 // section,
  //                 dataTime[0],
  //                 dataTime[1],
  //                 dataTime[2],
  //               ],
  //             ]);
  //           }
  //         });
  //       }
  //     }
  //   }
  // }

  // COMMANDS WITH THE PREFIX
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const infoHelp = message.content.slice(prefix.length).trim();
  console.log(`--- New info: ${args}`);
  console.log(`--- Message: ${message}`);
  const commandName = args.shift().toLowerCase();

  const marks = countInstances(infoHelp, '"');
  console.log(`--- Marks: ${marks}`);

  if (!client.commands.has(commandName)) return;

  // /ayuda "name_student" "course"
  if (commandName === 'ayuda') {
    if (marks === 4) {
      console.log(`--- Writing /ayuda from ${message.author}`);
      const dataTime = await getDataTime();
      // let section = {
      //   Lotus: 0,
      //   'Josefa España': 26,
      // };

      const sep = '"';
      const indices = [];
      for (let i = 0; i < infoHelp.length; i += 1) {
        if (infoHelp[i] === sep) indices.push(i);
      }

      console.log('--- INFOHELP:', infoHelp);
      const student = infoHelp.slice(indices[0] + 1, indices[1]);
      console.log('--- STUDENT:', student);
      const description = infoHelp.slice(indices[2] + 1, indices[3]);
      console.log('--- DESCRIPTION:', description);
      console.log('--- INFOHELP:', infoHelp);

      client2.authorize((err) => { // tokens
        if (err) {
          console.log(err);
        } else { 
          // const alumno = args.shift();
          console.log(`Actual row ${lastRow}`);
          // section = getSection(message);
          return gsWriteHelp(client2, [
            [
              message.author.username,
              dataTime[0],
              dataTime[1],
              dataTime[2],
              student,
              // section,
              description,
            ],
          ]);
        }
      });
      message.reply('He registrado correctamente tu ayuda ✅');
    } else {
      message.reply('Olvidaste poner algun parametro o las comillas ! ❌');
    }
  }

  // /asistencia for Students
  if (message.content === '/asistencia') {
    console.log(`--- Writing /asistencia from ${message.author}`);
    const dataTime = await getDataTime();

    client2.authorize((err) => { // tokens
      if (err) {
        console.log(err);
      } else {
        return gsWriteAssistanceStudent(client2, [
          [
            message.author.username,
            dataTime[0],
            dataTime[1],
            dataTime[2],
          ],
        ]);
      }
      return err;
    });
    message.reply('He registrado correctamente tu asistencia ✅');
  }

  // /asistencia-ayudante for TAs
  if (message.content === '/asistencia-ayudante') {
    if (message.member.roles.cache.some((role) => role.name === 'Ayudantes')) {
      console.log(`--- Writing /asistencia-ayudante from ${message.author}`);
      const dataTime = await getDataTime();

      client2.authorize((err) => { // tokens
        if (err) {
          console.log(err);
        } else {
          return gsWriteAssistanceTA(client2, [
            [
              message.author.username,
              dataTime[0],
              dataTime[1],
              dataTime[2],
            ],
          ]);
        }
        return err;
      });
      message.reply('He registrado correctamente tu asistencia ✅');
    } else {
      message.reply('Debes ser ayudante para utilizar este comando ❌');
    }
  }

  if (message.content === '/join') {
    console.log(`--- Executing /join from ${message.author}`);
    message.delete(1000);
    return client.emit('guildMemberAdd', message.author);
  }

  const command = client.commands.get(commandName);

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply(
      'No puedo ejecutar este comando en un chat privado, debes usarlo en el canal correspondiente :)',
    );
  }

  if (command.args && !args.length) {
    let reply = `No pusiste los argumentos necesarios ! ${message.author}`;

    if (command.usage) {
      reply += `\nLa forma correcta de usar el comando es: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `Por favor espera ${timeLeft.toFixed(
          1,
        )} segundo(s) mas antes de volver a usar el comando \`${command.name}\``,
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('Ocurrió un error al momento de ejecutar el comando :(');
  }
});

client.login(token);
