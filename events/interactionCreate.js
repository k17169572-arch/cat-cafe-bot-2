const { Events, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { User, ShopItem, Cooldown, DailyLimit, GlobalSetting } = require('../database');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            const userId = interaction.user.id;

            // --- Gacha Logic ---
            if (interaction.customId === 'gacha_roll') {
                const now = Date.now();
                const cooldownTime = 60 * 60 * 1000; // 1 Hour in ms

                // Check cooldown
                const cooldownRecord = await Cooldown.findOne({ user_id: userId });
                
                if (cooldownRecord) {
                    const expirationTime = cooldownRecord.last_gacha + cooldownTime;
                    if (now < expirationTime) {
                        const expiredTimestamp = Math.round(expirationTime / 1000);
                        return interaction.reply({ content: `⏳ คุณต้องรอจนถึง <t:${expiredTimestamp}:R> เพื่อสุ่มกาชาครั้งต่อไป`, ephemeral: true });
                    }
                }

                // RNG
                let dropIceCream = 0;
                let dropTea = 0;
                let dropCake = 0;
                let dropCat = 0;

                // Ice cream (50% chance to get 1-10)
                if (Math.random() < 0.50) dropIceCream = Math.floor(Math.random() * 10) + 1;
                // Tea (30% chance to get 1-10)
                if (Math.random() < 0.30) dropTea = Math.floor(Math.random() * 10) + 1;
                // Cake (20% chance to get 1-10)
                if (Math.random() < 0.20) dropCake = Math.floor(Math.random() * 10) + 1;
                // Cat (5% chance to get 1-5)
                if (Math.random() < 0.05) dropCat = Math.floor(Math.random() * 5) + 1;

                // If completely unlucky
                const isSalty = dropIceCream === 0 && dropTea === 0 && dropCake === 0 && dropCat === 0;

                // Update DB
                if (!isSalty) {
                    await User.findOneAndUpdate(
                        { user_id: userId },
                        { $inc: { ice_cream: dropIceCream, tea: dropTea, cake: dropCake, cat: dropCat } },
                        { upsert: true, new: true }
                    );
                } else {
                    // Make sure user exists even if unlucky
                    await User.findOneAndUpdate(
                        { user_id: userId },
                        { $setOnInsert: { ice_cream: 0, tea: 0, cake: 0, cat: 0 } },
                        { upsert: true }
                    );
                }

                // Update cooldown
                await Cooldown.findOneAndUpdate(
                    { user_id: userId },
                    { last_gacha: now },
                    { upsert: true }
                );

                // Result embed
                const resultEmbed = new EmbedBuilder()
                    .setTitle('🎲 ผลการสุ่มกาชาของคุณ!')
                    .setColor(isSalty ? '#808080' : '#FFD700');

                if (isSalty) {
                    resultEmbed.setDescription('น่าเสียดายจัง... เกลือล้วนๆ ไม่ได้อะไรเลย 😢\nลองใหม่ครั้งหน้านะ!');
                } else {
                    let desc = 'ยินดีด้วย! คุณได้รับ:\n\n';
                    if (dropIceCream > 0) desc += `🍦 ไอติม **${dropIceCream}** ชิ้น\n`;
                    if (dropTea > 0) desc += `🍵 ชา **${dropTea}** ถ้วย\n`;
                    if (dropCake > 0) desc += `🍰 เค้ก **${dropCake}** ชิ้น\n`;
                    if (dropCat > 0) desc += `🐱 **แมวหายาก!!** **${dropCat}** ตัว 🎉\n`;
                    
                    resultEmbed.setDescription(desc);
                }

                await interaction.reply({ embeds: [resultEmbed], ephemeral: true });
            }

            // --- Shop Category Logic ---
            else if (interaction.customId.startsWith('shop_category_')) {
                const currency = interaction.customId.replace('shop_category_', ''); // 'ice_cream', 'tea', 'cake', 'cat'
                
                const items = await ShopItem.find({ currency_type: currency });

                if (items.length === 0) {
                    return interaction.reply({ content: 'ยังไม่มีของรางวัลในหมวดหมู่นี้ให้แลก', ephemeral: true });
                }

                let currencyName = '';
                let emoji = '';
                switch(currency) {
                    case 'ice_cream': currencyName = 'ไอติม'; emoji = '🍦'; break;
                    case 'tea': currencyName = 'ชา'; emoji = '🍵'; break;
                    case 'cake': currencyName = 'เค้ก'; emoji = '🍰'; break;
                    case 'cat': currencyName = 'แมว'; emoji = '🐱'; break;
                }

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('shop_buy_select')
                    .setPlaceholder(`เลือกของที่คุณต้องการแลกด้วย ${currencyName}`)
                    .addOptions(
                        items.map(item => {
                            return new StringSelectMenuOptionBuilder()
                                .setLabel(`${item.description} (ราคา ${item.price} ${emoji})`)
                                .setValue(item.id.toString())
                                .setDescription(`แลกรับ ${item.type === 'role' ? 'ยศพิเศษ' : 'สิทธิพิเศษ'}`);
                        })
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);
                
                await interaction.reply({ 
                    content: `คุณกำลังเลือกหมวดหมู่ **${emoji} ${currencyName}**\nกรุณาเลือกรายการที่ต้องการแลกจากเมนูด้านล่าง:`, 
                    components: [row], 
                    ephemeral: true 
                });
            }
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'shop_buy_select') {
                const itemId = parseInt(interaction.values[0]);
                const userId = interaction.user.id;

                const item = await ShopItem.findOne({ id: itemId });
                if (!item) return interaction.reply({ content: 'ไม่พบไอเทมนี้ในระบบ', ephemeral: true });

                // Check global daily limit setting
                const limitSetting = await GlobalSetting.findOne({ key: 'daily_shop_limit' });
                const dailyLimit = limitSetting ? parseInt(limitSetting.value) : null;

                // Check user's daily limit for this item
                if (dailyLimit !== null) {
                    const userLimit = await DailyLimit.findOne({ user_id: userId, shop_item_id: item.id });
                    if (userLimit && userLimit.purchased_count >= dailyLimit) {
                        return interaction.reply({ content: `🚫 คุณซื้อไอเทมนี้ถึงขีดจำกัดรายวันแล้ว (${dailyLimit} ครั้ง/วัน)\nรีเซ็ตทุกเที่ยงคืน`, ephemeral: true });
                    }
                }

                // Check currency balance
                const user = await User.findOne({ user_id: userId });
                if (!user || user[item.currency_type] < item.price) {
                    return interaction.reply({ content: `❌ คุณมีของไม่พอ! ไอเทมนี้ต้องใช้ **${item.price} ${item.currency_type}** ในการแลก`, ephemeral: true });
                }

                // Process Purchase
                try {
                    // Deduct currency
                    await User.findOneAndUpdate(
                        { user_id: userId },
                        { $inc: { [item.currency_type]: -item.price } }
                    );

                    // Update limit
                    await DailyLimit.findOneAndUpdate(
                        { user_id: userId, shop_item_id: item.id },
                        { $inc: { purchased_count: 1 } },
                        { upsert: true }
                    );

                    if (item.type === 'role') {
                        const role = interaction.guild.roles.cache.get(item.role_id);
                        if (role) {
                            await interaction.member.roles.add(role);
                            await interaction.reply({ content: `🎉 สำเร็จ! คุณได้รับยศ **${role.name}** เรียบร้อยแล้ว`, ephemeral: true });
                        } else {
                            await interaction.reply({ content: `🎉 สำเร็จ! หักเงินแล้ว แต่ระบบไม่พบยศที่กำหนด โปรดติดต่อแอดมิน!`, ephemeral: true });
                        }
                    } else if (item.type === 'text') {
                        // Send DM
                        try {
                            await interaction.user.send(`🎁 **คุณได้รับสิทธิพิเศษ:** ${item.text_message}\nกรุณาติดต่อแอดมินเพื่อรับสิทธิ์!`);
                            await interaction.reply({ content: `🎉 สำเร็จ! กรุณาเช็คกล่องข้อความ (DM) ของคุณ`, ephemeral: true });
                        } catch (dmError) {
                            await interaction.reply({ content: `🎉 สำเร็จ! (แต่ไม่สามารถส่ง DM หาคุณได้)\nข้อความ: ${item.text_message}\nกรุณาติดต่อแอดมิน`, ephemeral: true });
                        }
                    }

                } catch (error) {
                    console.error('Purchase error:', error);
                    await interaction.reply({ content: 'เกิดข้อผิดพลาดในการซื้อของ', ephemeral: true });
                }
            }
        }
    },
};
