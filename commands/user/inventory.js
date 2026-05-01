const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('ดูไอเทมในกระเป๋าส่วนตัวของคุณ'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            let user = await User.findOne({ user_id: userId });
            
            if (!user) {
                // Create user if not exists
                user = new User({ user_id: userId });
                await user.save();
            }

            const embed = new EmbedBuilder()
                .setTitle(`🎒 กระเป๋าของ ${interaction.user.username}`)
                .setColor('#FFB6C1')
                .addFields(
                    { name: '🍦 ไอติม (Ice Cream)', value: `${user.ice_cream} ชิ้น\n*(รีเซ็ตทุกวันจันทร์)*`, inline: true },
                    { name: '🍵 ชา (Tea)', value: `${user.tea} ถ้วย`, inline: true },
                    { name: '🍰 เค้ก (Cake)', value: `${user.cake} ชิ้น`, inline: true },
                    { name: '🐱 แมว (Cat)', value: `${user.cat} ตัว`, inline: true }
                )
                .setFooter({ text: 'ใช้ของเหล่านี้แลกเปลี่ยนรางวัลที่ร้านค้าได้เลย!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'เกิดข้อผิดพลาดในการดึงข้อมูลกระเป๋า', ephemeral: true });
        }
    },
};
