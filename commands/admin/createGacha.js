const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creategacha')
        .setDescription('สร้างตู้กาชา (สำหรับแอดมิน)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('title')
                .setDescription('หัวข้อตู้กาชา')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('description')
                .setDescription('คำอธิบายตู้กาชา')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('image_url')
                .setDescription('URL รูปภาพตกแต่งตู้กาชา')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('color')
                .setDescription('สีของ Embed (Hex code เช่น #FFB6C1)')
                .setRequired(false)),
    async execute(interaction) {
        const title = interaction.options.getString('title') || '🍦 แมวเหมียวคาเฟ่ กาชาปอง 🐱';
        const description = interaction.options.getString('description') || 'สุ่มกาชารับของรางวัลมากมาย!\n(คูลดาวน์ 1 ชั่วโมง)\n\nไอติม 🍦 | ชา 🍵 | เค้ก 🍰 | แมว 🐱';
        const imageUrl = interaction.options.getString('image_url') || null;
        const color = interaction.options.getString('color') || '#FFB6C1';

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);
            
        if (imageUrl) {
            embed.setImage(imageUrl);
        }

        const button = new ButtonBuilder()
            .setCustomId('gacha_roll')
            .setLabel('🎲 สุ่มกาชา!')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'สร้างตู้กาชาเรียบร้อยแล้ว!', ephemeral: true });
    },
};
