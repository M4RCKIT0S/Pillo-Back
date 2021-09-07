const Order = require('../Models/order');
const Product = require('../Models/item').product;

let orderInterface ={
 status:{
     key: 'number',
     value:'string'
 },
 phoneNumber: 'number',
 paymentMethod: 'string',
 address:{
     street: 'string',
     city: 'string',
     postalCode: 'number'
 },
 subtotal: 'number',
 tip: 'number',
 notes: 'string'
}
async function createOrder(req, res){
    try {
        const userId = req.userData.id;
        const {status, phoneNumber, products, paymentMethod, address, subtotal, tip, notes} = req.body;
        var keys = Object.keys(req.body);
        for(var keyBody  in keys){
            if(keys[keyBody]!== 'total' && keys[keyBody]!=='products'){
                var obj = keys[keyBody]
                if(typeof(req.body[obj])==='object'){
                    let i;
                    var q = Object.keys(obj);
                    for(i=0; i< q.length;i++){
                        if(typeof(orderInterface[q])!==typeof(obj.q)) return res.status(500).send({message:`Bad format for ${keys[keyBody]}. It should be ${orderInterface[obj]}.`, success: false, date: Date()});
                    }
                }else
                    if(orderInterface[obj] !== typeof(req.body[obj])) return res.status(500).send({message:`Bad format for ${keys[keyBody]}. It should be ${orderInterface[obj]}.`, success: false, date: Date()});
            }
            
        }
        if((status && (!(typeof(status.key) === 'number') || !(typeof(status.value) ==='string') )) || (subtotal && !(typeof(subtotal) === 'number'))  || (phoneNumber &&!(typeof(phoneNumber) ==='number')) || (paymentMethod && !(typeof(paymentMethod)==='string')) || (tip && !(typeof(tip) ==='number')) || (notes && !(typeof(notes) === 'string')) || (address && !(typeof(address.street) === 'string') ) || (address && !(typeof(address.city)==='string')) || (address && !(typeof(address.postalCode)==='number')) )
        return res.status(400).send({message:'One or more parameters have an invalid format. Please try again.', success: false, date: Date()});
        var total =0;
        if(!products) return res.status(400).send({message:'You can not create an order without products.', success: false, date: Date()});
        const productsFromDb = await promiseToFindProducts(products);
        console.log(productsFromDb)
        if(!checkStock(productsFromDb, products)) return res.status(400).send({message:'Bad request, not all quantities are availeable.', success:false, date: Date()});
        const updatedProducst = await promiseToUpdateStock(productsFromDb, products);
        console.log(updatedProducst)
        if(typeof(subtotal)=='number'){
            total += subtotal;
        }
        if(typeof(tip)==='number'){
            total += tip;
        }
        const shops = await promiseToCountShops(products);
        console.log(shops)
        const order = new Order({
            user: userId,
            status,phone: phoneNumber, products, shops,paymentMethod, address, subtotal, tip, notes, total
        })
        const orderSaved = await order.save();
        return res.status(200).send({message:'Order saved successfully.', success: true, orderSaved, date: Date()});
    } catch (error) {
        return res.status(500).send({message:'Error saving order.', error,success: false, date: Date()});
    }
}
const promiseToFindProducts = (products) =>{
    var productsToReturn = [];
    return new Promise(async(resolve , reject)=>{
        for(var i=0; i<products.length;i++){
            var product = await Product.findOne({_id: products[i].productId}).exec();
            var indexOfArray = productsToReturn.findIndex(j=>JSON.stringify(j._id) ==JSON.stringify(product._id));
            if(indexOfArray === -1) productsToReturn.push(product);
            if(i -products.length === -1){
                resolve(productsToReturn);
            }
        }
        /**products.forEach(async (element, index)=>{
            
        })*/
    })
}
const checkStock = (productsFromDb, products) =>{
    var areAllValid = false;
    products.forEach((el, index)=>{
        if(el.variant){
            var found = false, i=0;
            while(!found && i<productsFromDb.length){
                console.log(el.productId, productsFromDb[i]._id)
                if(JSON.stringify(el.productId)=== JSON.stringify(productsFromDb[i]._id)) found = true;
                if(!found) i++;
            }
            if(!found) return false;
            var found2 = false, j =0;
            if(productsFromDb[i].variants){
                while(!found2 && j<productsFromDb[i].variants.length){
                    if( productsFromDb[i].variants && 
                        el.variant.size === productsFromDb[i].variants[j].size &&
                        el.variant.color === productsFromDb[i].variants[j].color &&
                        el.variant.dimension === productsFromDb[i].variants[j].dimension &&
                        el.variant.cool === productsFromDb[i].variants[j].cool &&
                        el.variant.measure === productsFromDb[i].variants[j].measure &&
                        el.variant.type === productsFromDb[i].variants[j].type ){
                        found2 = true;
                    }
                    if(!found2) j++;
                }
                if(!found2) return false;
                console.log(productsFromDb[i].variants[j].stock - el.quantity<0,productsFromDb[i].variants[j].stock,el.quantity )
                if(productsFromDb[i].variants[j].stock - el.quantity<0) return false;
            }
        }else{
            var found3 = false, a =0, quantity;
            while(!found3 && a< productsFromDb.length){
                if(JSON.stringify(el.productId)===JSON.stringify(productsFromDb[a]._id)) found3 = true;
                if(!found3) a++;
            }
            if(!found3) return false;
            if(productsFromDb[a].stock - el.quantity<0) return false;
        }
        console.log(index, products.length)
        if(index-products.length===-1) areAllValid= true;
    })
    return areAllValid;
}
const promiseToUpdateStock = (productsFromDb, products) =>{
    var productsUpdated = [];
    return new Promise(async(resolve, reject)=>{
        for(var p=0;p<products.length;p++){
            var element = products[p];
            if(element.variant){
                var found = false, i =0;
                while(!found && i<productsFromDb.length){
                    if(element.productTd===productsFromDb[i].productId) found = true;
                    if(!found) i++;
                }
                if(!found) reject(`No se ha encontrado producto con id: ${element.productId}`);
                var found2 = false, j =0;
                if(productsFromDb[i].variants){
                    while(!found2 && j<productsFromDb[i].variants.length){
                        if( productsFromDb[i].variants && 
                            element.variant.size === productsFromDb[i].variants[j].size &&
                            element.variant.color === productsFromDb[i].variants[j].color &&
                            element.variant.dimension === productsFromDb[i].variants[j].dimension &&
                            element.variant.cool === productsFromDb[i].variants[j].cool &&
                            element.variant.measure === productsFromDb[i].variants[j].measure &&
                            element.variant.type === productsFromDb[i].variants[j].type ){
                            found2 = true;
                        }
                        if(!found2) j++;
                    }
                    if(found2){
                        var quantity = 0;
                        if(typeof(element.quantity) === 'number'){
                            quantity = productsFromDb[i].variants[j].stock - element.quantity;
                            console.log(quantity)
                            if(quantity<0){
                                reject(`No such quantity availeable for ${productsFromDb[i].name}`);
                                return;
                            } 
                                try{
                                    var variantToUpdate = `variants.${j}.stock`;
                                    var obj = {};
                                    obj[variantToUpdate] = quantity
                                    console.log(obj)
                                    var productUpdated = await Product.findOneAndUpdate({_id: element.productId},{$set:obj},{new: true}).exec();
                                }catch(error){
                                    reject(error)
                                }
                                productsUpdated.push(productUpdated);
                        }else{
                            reject('Quantity of object is not a number.');
                        }
                        
                    }else{
                        reject('No such variant found.');
                    }
                }
            }else{
                var found3 = false, a =0;
                console.log(productsFromDb)
                while(!found3 && a< productsFromDb.length){
                    if(JSON.stringify(element.productId)===JSON.stringify(productsFromDb[a]._id)) found3 = true;
                    if(!found3) a++;
                }
                if(!found3) reject(`No object found for id: ${element.productId}`);
                var quantity = 0;
                if(typeof(element.quantity) === 'number'){
                    console.log(a)
                    console.log(productsFromDb[a])
                    quantity = productsFromDb[a].stock - element.quantity;
               }else{
                   reject('Quantity of object is not a number.');
               }
                try {
                    var update = await Product.findOneAndUpdate({_id: element.productId},{$set: {stock:quantity}},{new: true}).exec();
                    productsUpdated.push(update);
                } catch (error) {
                    reject(error);
                }
            }
            if(p - products.length === -1) resolve(productsUpdated);
        };
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
            if(index - products.length  === -1){
                resolve(count);
            }
        });
    })
}

async function getOrdersUser(req, res){
    try{
        const userId = req.userData.id;
        const orders = await Order.find({user: userId}).populate({path:'products',populate:{ path:'productId'}}).then((orders) =>{
            return res.status(200).send({message:'Orders found successfully.', success: true, orders, date:Date()});

        });
        if(!orders) return res.status(404).send({message:'No orders found for this user.', success: false , date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error finding orders for this user.', error,success: false, date:Date()});
    }
}

async function getAllOrders(req, res){
    try{
        const orders = await Order.find();
        if(!orders) return res.status(404).send({message:'No orders found.', success: false , date: Date()});
        return res.status(200).send({message:'Orders found successfully.', success: true, orders, date:Date()});
    }catch(error){
        return res.status(500).send({message:'Error finding orders.', error,success: false, date:Date()});
    }
}
async function getOrder(req, res){
    try{
        const {orderId} = req.body;
        const order = await Order.findOne({_id: orderId});
        if(!order) return res.status(404).send({message:'No order found for such id.', success: false , date: Date()});
        return res.status(200).send({message:'Ordersfound successfully.', success: true, order, date:Date()});
    }catch(error){
        return res.status(500).send({message:'Error finding this order.', error,success: false, date:Date()});
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