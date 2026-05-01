const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
    ice_cream: { type: Number, default: 0 },
    tea: { type: Number, default: 0 },
    cake: { type: Number, default: 0 },
    cat: { type: Number, default: 0 }
});

const shopItemSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    type: { type: String, required: true }, // 'role' or 'text'
    currency_type: { type: String, required: true }, // 'ice_cream', 'tea', 'cake', 'cat'
    price: { type: Number, required: true },
    role_id: { type: String, default: null },
    text_message: { type: String, default: null },
    description: { type: String, required: true }
});

const cooldownSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
    last_gacha: { type: Number, default: 0 }
});

const dailyLimitSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    shop_item_id: { type: Number, required: true },
    purchased_count: { type: Number, default: 0 },
    last_purchased: { type: Number, default: 0 }
});
dailyLimitSchema.index({ user_id: 1, shop_item_id: 1 }, { unique: true });

const globalSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String }
});

const User = mongoose.model('User', userSchema);
const ShopItem = mongoose.model('ShopItem', shopItemSchema);
const Cooldown = mongoose.model('Cooldown', cooldownSchema);
const DailyLimit = mongoose.model('DailyLimit', dailyLimitSchema);
const GlobalSetting = mongoose.model('GlobalSetting', globalSettingSchema);

module.exports = {
    User,
    ShopItem,
    Cooldown,
    DailyLimit,
    GlobalSetting
};
