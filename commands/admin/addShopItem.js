const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ShopItem } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addshopitem')
        .setDescription('เพิ่มของรางวัลเข้าร้านค้า (สำหรับแอดมิน)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('currency')
                .setDescription('สกุลเงินที่ใช้แลก')
                .setRequired(true)
                .addChoices(
                    { name: '🍦 ไอติม', value: 'ice_cream' },
                    { name: '🍵 ชา', value: 'tea' },
                    { name: '🍰 เค้ก', value: 'cake' },
                    { name: '🐱 แมว', value: 'cat' }
                ))
        .addIntegerOption(option =>
            option.setName('price')
                .setDescription('ราคาที่ใช้แลก')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('คำอธิบาย/ชื่อของที่จะแสดงในร้านค้า')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('ยศที่จะได้รับ (ใส่ถ้าต้องการให้แลกเป็นยศ)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('text_message')
                .setDescription('ข้อความที่จะส่งให้ผู้ใช้และแอดมิน (ใส่ถ้าต้องการให้แลกเป็นข้อความพิเศษ เช่น แมว)')
                .setRequired(false)),
    async execute(interaction) {
        const currency = interaction.options.getString('currency');
        const price = interaction.options.getInteger('price');
        const description = interaction.options.getString('description');
        const role = interaction.options.getRole('role');
        const textMessage = interaction.options.getString('text_message');

        if (!role && !textMessage) {
            return interaction.reply({ content: 'กรุณาระบุ Role หรือ Text Message อย่างใดอย่างหนึ่ง', ephemeral: true });
        }

        const type = role ? 'role' : 'text';
        const roleId = role ? role.id : null;

        try {
            const newItem = new ShopItem({
                id: Date.now(),
                type,
                currency_type: currency,
                price,
                role_id: roleId,
                text_message: textMessage,
                description
            });
            await newItem.save();
            await interaction.reply({ content: `เพิ่มไอเทม **${description}** ลงในร้านค้าเรียบร้อยแล้ว!\nราคา: ${price} ${currency}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล', ephemeral: true });
        }
    },
};
