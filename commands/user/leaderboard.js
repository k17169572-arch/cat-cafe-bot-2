const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('ดูอันดับคนที่มีไอเทมเยอะที่สุด')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('ไอเทมที่ต้องการดูอันดับ')
                .setRequired(true)
                .addChoices(
                    { name: '🍦 ไอติม', value: 'ice_cream' },
                    { name: '🍵 ชา', value: 'tea' },
                    { name: '🍰 เค้ก', value: 'cake' },
                    { name: '🐱 แมว', value: 'cat' }
                )),
    async execute(interaction) {
        const itemType = interaction.options.getString('item');

        let itemName = '';
        let emoji = '';
        switch (itemType) {
            case 'ice_cream': itemName = 'ไอติม'; emoji = '🍦'; break;
            case 'tea': itemName = 'ชา'; emoji = '🍵'; break;
            case 'cake': itemName = 'เค้ก'; emoji = '🍰'; break;
            case 'cat': itemName = 'แมว'; emoji = '🐱'; break;
        }

        try {
            const topUsers = await User.find().sort({ [itemType]: -1 }).limit(10);

            const embed = new EmbedBuilder()
                .setTitle(`🏆 อันดับผู้ที่มี ${itemName} เยอะที่สุด`)
                .setColor('#FFD700');

            if (topUsers.length === 0) {
                embed.setDescription('ยังไม่มีข้อมูล');
            } else {
                let description = '';
                for (let i = 0; i < topUsers.length; i++) {
                    const user = topUsers[i];
                    const amount = user[itemType] || 0;
                    if (amount === 0) continue; // ข้ามคนที่มี 0

                    let medal = '';
                    if (i === 0) medal = '🥇';
                    else if (i === 1) medal = '🥈';
                    else if (i === 2) medal = '🥉';
                    else medal = '🏅';

                    description += `${medal} **อันดับ ${i + 1}**: <@${user.user_id}> - ${amount} ${emoji}\n`;
                }

                if (description === '') {
                    description = `ยังไม่มีใครมี ${itemName} เลย!`;
                }
                embed.setDescription(description);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'เกิดข้อผิดพลาดในการดึงข้อมูล', ephemeral: true });
        }
    },
};
