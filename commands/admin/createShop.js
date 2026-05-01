const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createshop')
        .setDescription('สร้างร้านค้า (สำหรับแอดมิน)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('title')
                .setDescription('หัวข้อร้านค้า')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('description')
                .setDescription('คำอธิบายร้านค้า')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('image_url')
                .setDescription('URL รูปภาพตกแต่งร้านค้า')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('color')
                .setDescription('สีของ Embed (Hex code เช่น #FFB6C1)')
                .setRequired(false)),
    async execute(interaction) {
        const title = interaction.options.getString('title') || '🛍️ ร้านค้าคาเฟ่แมว 🐾';
        const description = interaction.options.getString('description') || 'เลือกหมวดหมู่ไอเทมที่คุณต้องการใช้แลกเปลี่ยน!';
        const imageUrl = interaction.options.getString('image_url') || null;
        const color = interaction.options.getString('color') || '#FFB6C1';

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);
            
        if (imageUrl) {
            embed.setImage(imageUrl);
        }

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_category_ice_cream')
                    .setLabel('🍦 แลกเปลี่ยนด้วยไอติม')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('shop_category_tea')
                    .setLabel('🍵 แลกเปลี่ยนด้วยชา')
                    .setStyle(ButtonStyle.Success)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_category_cake')
                    .setLabel('🍰 แลกเปลี่ยนด้วยเค้ก')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('shop_category_cat')
                    .setLabel('🐱 แลกเปลี่ยนด้วยแมว')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.channel.send({ embeds: [embed], components: [row1, row2] });
        await interaction.reply({ content: 'สร้างร้านค้าเรียบร้อยแล้ว!', ephemeral: true });
    },
};
