const Shop = require('../Models/shop');

async function createShop(req, res){
    const { shop } = req.body;
    const shopModel = new Shop({
        shop
    })
    shopModel.save((errorSaving, ShopSaved)=>{
        if(errorSaving) return res.status(500).send({message:'Error saving shop.', errorSaving,success: true, date: Date()});
        return res.status(200).send({message:'Shop saved successfully.',ShopSaved, success:true, date:Date()});
    });
}

async function getShop(req, res){
    try{
        const {id} = req.body;
        const shop = await Shop.findOne({id});
        if(!shop) return res.status(404).send({message:'Shop not found. Invalid shop.', success: false, date:Date()});
        return res.status(200).send({message:'Shop found successfully. This shop is Valid.', shop: shop, success: true, date:Date()});
    }catch(error){
        return res.status(500).send({message:'Internal server error.', success:false, date:Date()});
    }
}
async function getAllShops(req, res){
    try{
        const shops = await Shop.find({});
        if(!shops) return res.status(404).send({message:'There are no shops.', success: true, date:Date()});
        return res.status(200).send({message:'Shops found successfully.', shops: shops, success: true, date:Date()});
    }catch(error){
        return res.status(500).send({message:'Internal server error.', success:false, date:Date()});
    }
}

async function updateShop(req, res){
    const {id, name, addProductId, deleteProductId} = req.body;

    const changeName = name ? {$set:{name}} : {}
    const addProduct = addProductId ? {$push:{products: addProductId}} : {}
    const deleteProduct = deleteProductId ? {$pull:{products: deleteProductId}} : {}

    Shop.findOneAndUpdate({id},{changeName,addProduct,deleteProduct}, (err, shopUpdated)=>{
        if(err) return res.status(500).send({message:'Internal server error.', success:false, date:Date()});
        if(!shopUpdated) return res.status(404).send({message:'Shop not found.', success: false, date:Date()});
        return res.status(200).send({message:'Shop updated successfully.', shopUpdated, success: true, date:Date()});
    })
}


async function deleteShop(req, res){
    const {id} = req.body;
    Shop.findOneAndDelete({id},(err, shopDeleted)=>{
        if(err) return res.status(500).send({message:'Internal server error.', success:false, date:Date()});
        if(!shopDeleted) return res.status(404).send({message:'Shop not found.', success: false, date:Date()});
        return res.status(200).send({message:'Shop deleted successfully.', shopDeleted, success: true, date:Date()});
    })
}


module.exports = {
    createShop,
    getShop,
    getAllShops,
    updateShop,
    deleteShop
}