require('dotenv').config();
const http = require('http');

// สร้างหน้าเว็บจำลองเพื่อหลอก Render ให้ตรวจจับ Port ได้
http.createServer((req, res) => {
    res.write("Bot is running!");
    res.end();
}).listen(process.env.PORT || 3000);

const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { User, DailyLimit } = require('./database');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection();
const commandsArray = [];

// Load commands
const loadCommands = (dir) => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
        const stat = fs.lstatSync(path.join(__dirname, dir, file));
        if (stat.isDirectory()) {
            loadCommands(path.join(dir, file));
        } else if (file.endsWith('.js')) {
            const command = require(path.join(__dirname, dir, file));
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commandsArray.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
            }
        }
    }
};

loadCommands('commands');

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Register slash commands
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
            { body: commandsArray },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    // Cron Jobs
    
    // Reset Ice Cream every Monday at Midnight (00:00)
    cron.schedule('0 0 * * 1', async () => {
        console.log('Running weekly Ice Cream reset...');
        try {
            await User.updateMany({}, { ice_cream: 0 });
            console.log('Ice Cream has been reset for all users.');
        } catch (error) {
            console.error('Error resetting ice cream:', error);
        }
    }, {
        timezone: "Asia/Bangkok"
    });

    // Reset Daily Limits every day at Midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily shop limit reset...');
        try {
            await DailyLimit.updateMany({}, { purchased_count: 0 });
            console.log('Daily limits have been reset.');
        } catch (error) {
            console.error('Error resetting daily limits:', error);
        }
    }, {
        timezone: "Asia/Bangkok"
    });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB.');
    client.login(process.env.BOT_TOKEN);
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});
