const fs = require('fs');
const Discord = require('discord.js')
const client = new Discord.Client({ ws: { intents: Discord.Intents.NON_PRIVILEGED } });
require('dotenv').config();

// PERDON MUNDO POR EL CODIGO TAN DESORDENADO PERO SE QUE ESTO NO VA A ESCALAR SO WHO CARES !
// - y si escala lo hago de 0 :(

const {google} = require('googleapis');
let client_email = process.env.CLIENT_EMAIL;
let private_key = process.env.PRIVATE_KEY;
const keys = require('./google-credentials.json');
let last_F = null;

function countInstances(string, word) {
    return string.split(word).length - 1;
 }

const client2 = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      ['https://www.googleapis.com/auth/spreadsheets'],
);

async function gswriteassitance(client, data) {

    const gsapi = google.sheets({version:'v4', auth: client});


    const appendOptions = {
        spreadsheetId: '1SdXJiswge8RVo1gOGmFFxTrznHvli6DtaoQ4S3pnPbs',
        range: 'Asistencia-Ayudantes-[BOT]!A1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: data},
    };

    let res = await gsapi.spreadsheets.values.append(appendOptions);
    console.log(res);
    // console.log(newDataArray);
}

async function gswriteassitanceAlumno(client, data) {

    const gsapi = google.sheets({version:'v4', auth: client});


    const appendOptions = {
        spreadsheetId: '1SdXJiswge8RVo1gOGmFFxTrznHvli6DtaoQ4S3pnPbs',
        range: 'Asistencia-Estudiantes-[BOT]!A1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: data},
    };

    let res = await gsapi.spreadsheets.values.append(appendOptions);
    console.log(res);
    // console.log(newDataArray);
}

async function gswritehelp(client, data) {

    const gsapi = google.sheets({version:'v4', auth: client});


    const appendOptions = {
        spreadsheetId: '1SdXJiswge8RVo1gOGmFFxTrznHvli6DtaoQ4S3pnPbs',
        range: 'Ayudas-[BOT]!A1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: data},
    };

    let res = await gsapi.spreadsheets.values.append(appendOptions);
    console.log(res);
    gscountrows(client);
    // console.log(newDataArray);
}

async function gscountrows(client) {

    const gsapi = google.sheets({version:'v4', auth: client});


    const readOptions = {
        spreadsheetId: '1SdXJiswge8RVo1gOGmFFxTrznHvli6DtaoQ4S3pnPbs',
        range: 'Ayudas-[BOT]!A1:A100000000',
    };

    let res = await gsapi.spreadsheets.values.get(readOptions);
    console.log("REEEEEEEEEEEEEEEEEEEEEEEEES", res.data.values.length);
    console.log("LEEEEEEEEEN", typeof res.data.values.length);
    last_F = res.data.values.length + 1;
    // console.log(newDataArray);
}

async function get_actual_f(client2) {
    return gscountrows(client2);
}


// const { prefix, token } = require('./config.json');
const prefix = process.env.PREFIX;
const token = process.env.TOKEN;


client.commands = new Discord.Collection();

const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command)
}

client.once('ready', () => {
    console.log("Pythoncita is online !");
    gscountrows(client2);
});

client.on('guildMemberAdd', member => {
	member.send(`Welcome to the server, ${member.username}!`).then(sentEmbed => {
        sentEmbed.react("👍")
    });
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
   
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const infoHelp = message.content.slice(prefix.length).trim();
    console.log("Llego esto !", args);
    const commandName = args.shift().toLowerCase();
    console.log(message);

    let marks = countInstances(infoHelp, '"')
    console.log("MARKS!", marks);

    if (commandName === 'ayuda' ) {
        if (marks === 4) {
            console.log("Se ejecuto el write !");
            console.log(message.author);
            const d = new Date();
            const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Domingo"];
            const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
            const time = d.getHours().toString() + ":" + d.getMinutes().toString() + ":" + d.getSeconds().toString(); 
            // const studentSection = {
            //     "Lotus": 0,
            //     "Josefa España": 26
            // }

            const sep = '"';
            const indices = [];
            for(let i = 0; i < infoHelp.length; i++) {
                if (infoHelp[i] === sep) indices.push(i);
            }

            console.log("INFOHELP!", infoHelp);
            const student = infoHelp.slice(indices[0] + 1, indices[1]);
            console.log("STUDENT !", student);
            const description = infoHelp.slice(indices[2] + 1, indices[3]);
            console.log("DESCRIPTION !", description);
            console.log("INFOHELP!", infoHelp);

            client2.authorize((err, tokens) => {
        
                if (err) {
                    console.log(err);
                    return;
                } else {
                    // console.log("Connected to googlesheets !");
                    let alumno = args.shift();
                    // $ayuda "Nombre" "Descripcion"
                    console.log("Actual F !!!!!!!!", last_F);
                    // let seccion_function = `1`;
                    return gswritehelp(client2, [[message.author.username, days[d.getDay()], d.getDate(), months[d.getMonth()], time, student, description]]);
                }
            });
            message.reply("He registrado correctamente tu ayuda ✅")
        }
        else {
            message.reply("Olvidaste poner algun parametro o las comillas ! ❌")
        }

    } 
    
    if (message.content === '/asistencia') {
      console.log("Se ejecuto el write !");
      console.log(message.author);
      let d = new Date();
      let days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Domingo"];
      let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
      let time = d.getHours().toString() + ":" + d.getMinutes().toString() + ":" + d.getSeconds().toString(); 

      client2.authorize((err, tokens) => {
  
          if (err) {
              console.log(err);
              return;
          } else {
              // console.log("Connected to googlesheets !");
              return gswriteassitanceAlumno(client2, [[message.author.username, days[d.getDay()], d.getDate(), months[d.getMonth()], time]]);
          }
      });
      message.reply("He registrado correctamente tu asistencia ✅")
    }
    
    if (message.content === '/asistencia-ayudante') {
        if (message.member.roles.cache.some(role => role.name === "Ayudantes")) {
            console.log("Se ejecuto el write !");
            console.log(message.author);
            let d = new Date();
            let days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Domingo"];
            let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
            let time = d.getHours().toString() + ":" + d.getMinutes().toString() + ":" + d.getSeconds().toString(); 

            client2.authorize((err, tokens) => {
        
                if (err) {
                    console.log(err);
                    return;
                } else {
                    // console.log("Connected to googlesheets !");
                    return gswriteassitance(client2, [[message.author.username, days[d.getDay()], d.getDate(), months[d.getMonth()], time]]);
                }
            });
            message.reply("He registrado correctamente tu asistencia ✅")
        }
        else {
            message.reply("Debes ser ayudante para utilizar este comando ❌")
        }
	}

    if (message.content === '/join') {
        console.log("Se ejecuto el join !");
        console.log(message.author);
        message.delete(1000);
		return client.emit('guildMemberAdd', message.author);
	}

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName)

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply("No puedo ejecutar este comando en un chat privado, debes usarlo en el canal correspondiente :)")
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
            return message.reply(`Por favor espera ${timeLeft.toFixed(1)} segundo(s) mas antes de volver a usar el comando \`${command.name}\``);
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