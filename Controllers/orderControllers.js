const Order = require('../Models/order');
const Product = require('../Models/item').product;

async function createOrder(req, res){
    try {
        const userId = req.userData.id;
        const {status, phoneNumber, products, paymentMethod, address, subtotal, tip, notes} = req.body;
        var total =0;
        if(!products) return res.status(400).send({message:'You can not create an order without products.', success: false, date: Date()});
        const productsFromDb = await promiseToFindProducts(products);
        const updatedProducst = await promiseToUpdateStock(productsFromDb, products)
        if(typeof(subtotal)=='number'){
            total += subtotal;
        }
        if(typeof(tip)==='number'){
            total += tip;
        }
        const shops = await promiseToCountShops(products);
        const order = new Order({
            user: userId,
            status, phoneNumber, products, shops,paymentMethod, address, subtotal, tip, notes, total
        })
        const orderSaved = await order.save();
        return res.status(200).send({message:'Order saved successfully.', success: true, orderSaved, date: Date()});
    } catch (error) {
        return res.status(500).send({message:'Error saving order.', success: false, date: Date()});
    }
}
const promiseToFindProducts = (products) =>{
    var productsToReturn = [];
    return new Promise((resolve , reject)=>{
        products.forEach(async (element, index)=>{
            var product = await Product.find({_id: element.productId});
            productsToReturn = productsToReturn.push(product);
            if(products.length - index === -1){
                resolve(count);
            }
        })
    })
}
const promiseToUpdateStock = (productsFromDb, products) =>{
    var productsUpdated = [];
    return new Promise((resolve, reject)=>{
        products.forEach(async(element, index)=>{
            if(element.variant){
                var found = false, i =0;
                while(!found && i<productsFromDb.length){
                    if(element._id===productsFromDb[i]._id) found = true;
                    if(!found) i++;
                }
                if(!found) reject(`No se ha encontrado producto con id: ${element._id}`);
                var found2 = false, j =0;
                while(!found2 && j<productsFromDb[i].variants.length){
                    if(element.variant.size === productsFromDb[i].variants[j].size &&
                        element.variant.color === productsFromDb[i].variants[j].color &&
                        element.variant.dimension === productsFromDb[i].variants[j].dimension &&
                        element.variant.cool === productsFromDb[i].variants[j].cool &&
                        element.variant.measure === productsFromDb[i].variants[j].measure &&
                        element.variant.type === productsFromDb[i].variants[j].type ){
                        found = true;
                        var quantity = 0;
                        if(typeof(element.quantity) === 'number'){
                             quantity = productsFromDb[i].variants[j].stock - element.quantity;
                        }else{
                            reject('Quantity of object is not a number.');
                        }
                        try{
                            var variantToUpdate = `variants.${j}.stock`;
                            var obj = {};
                            obj[variantToUpdate] = quantity
                            var productUpdated = await Product.findOneAndUpdate({_id: element.productId},{$set:obj},{new: true}).exec();
                        }catch(error){
                            reject(error)
                        }
                        productsUpdated = productsUpdated.push(productUpdated);
                    }
                    if(!found2) j++;
                }
            }else{
                var found3 = false, a =0;
                while(!found3 && a< productsFromDb.length){
                    if(element._id===productsFromDb[a]._id) found3 = true;
                    if(!found3) a++;
                }
                if(!found3) reject(`No object found for id: ${element._id}`);
                var quantity = 0;
                if(typeof(element.quantity) === 'number'){
                    quantity = productsFromDb[a].stock - element.quantity;
               }else{
                   reject('Quantity of object is not a number.');
               }
                try {
                    var update = await Product.findOneAndUpdate({_id: element.productId},{$set: {stock:quantity}},{new: true}).exec();
                    productsUpdated = productUpdated.push(update);
                } catch (error) {
                    reject(error);
                }
            }
            if(products.length - index === -1) resolve(productsUpdated);
        })
    })
}
const promiseToCountShops = (products, ids)=>{
    return new Promise((resolve, reject)=>{
        var count  =0;
        var shops = {};
        products.forEach(async (element, index) => {
            if(!shops[element.shop]){
                count++;
                shops[element.shop] = 1;
            }
            shops[element.shop] += 1;
            if(products.length - index === -1){
                resolve(count);
            }
        });
    })
}

async function getOrdersUser(req, res){
    try{
        const userId = req.userData.id;
        const orders = await Order.find({user: userId});
        if(!orders) return res.status(404).send({message:'No orders found for this user.', success: false , date: Date()});
        return res.status(200).send({message:'Orders found successfully.', success: true, orders, date:Date()});
    }catch(error){
        return res.status(200).send({message:'Error finding orders for this user.', error,success: false, date:Date()});
    }
}

async function getAllOrders(req, res){
    try{
        const orders = await Order.find();
        if(!orders) return res.status(404).send({message:'No orders found.', success: false , date: Date()});
        return res.status(200).send({message:'Orders found successfully.', success: true, orders, date:Date()});
    }catch(error){
        return res.status(200).send({message:'Error finding orders.', error,success: false, date:Date()});
    }
}
async function getOrder(req, res){
    try{
        const {orderId} = req.body;
        const order = await Order.findOne({_id: orderId});
        if(!order) return res.status(404).send({message:'No order found for such id.', success: false , date: Date()});
        return res.status(200).send({message:'Ordersfound successfully.', success: true, order, date:Date()});
    }catch(error){
        return res.status(200).send({message:'Error finding this order.', error,success: false, date:Date()});
    }
}
async function editOrder(req, res){
    try{
        const {status, orderId} = req.body;
        const order = await Order.findOneAndUpdate({_id: orderId},{$set:{status}},{new: true});
        if(!order) return res.status(404).send({message:'No order found.', success: false, date: Date()});
        return res.status(200).send({message:'Order status updated successfully.', success: true, order, date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error updating order status.', success: false, error, date: Date()});
    }

}
async function deleteOrder(req, res){
    try {
        const {orderId} = req.body;
        const order = await Order.findOneAndDelete({_id:orderId});
        if(!order) return res.status(404).send({message:'Order not found. Try again.', success: false, date: Date()});
        return res.status(200).send({message:'Order deleted successfully.', success: true, order, date: Date()});
    } catch (error) {
        return res.status(500).send({message:'Error deleting order.', error,success: false, date: Date()});
    }
}

module.exports = {
    createOrder,
    getOrdersUser,
    getAllOrders,
    editOrder,
    getOrder,
    deleteOrder
}