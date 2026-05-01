const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GlobalSetting } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlimit')
        .setDescription('กำหนดจำนวนจำกัดการซื้อต่อวัน (สำหรับแอดมิน)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option => 
            option.setName('limit')
                .setDescription('จำนวนครั้งที่สามารถซื้อได้ต่อวัน')
                .setRequired(true)),
    async execute(interaction) {
        const limit = interaction.options.getInteger('limit');

        try {
            await GlobalSetting.findOneAndUpdate(
                { key: 'daily_shop_limit' },
                { value: limit.toString() },
                { upsert: true }
            );
            await interaction.reply({ content: `ตั้งค่าจำกัดการซื้อต่อวันเป็น **${limit}** ครั้งต่อวันเรียบร้อยแล้ว`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'เกิดข้อผิดพลาดในการตั้งค่า', ephemeral: true });
        }
    },
};
