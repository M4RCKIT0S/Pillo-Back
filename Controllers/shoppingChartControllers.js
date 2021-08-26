//Models
const ShoppingChart = require('../Models/shoppingChart');
const Product = require('../Models/item').product;

async function createShoppingChart(req, res){
        const {products} = req.body;
        const {id} = req.userData;
        var productsFoundAndQuantities = [];
        var subtotal = 0;
        var extras = 0;
        const findIfAlreadyHasOne = await ShoppingChart.findOne({user: id});
        if(findIfAlreadyHasOne) return res.status(400).send({message:'Bad request. This user already has one.', success: false, date: Date()});
        if(products){
            var promiseForEach = new Promise((resolve, reject) =>{
                products.forEach(async (element, index, array) => {
                    console.log(element)
                    var product = await Product.findOne({_id: element.product});
                    productsFoundAndQuantities.push({product, quantity: element.quantity});
                    console.log(productsFoundAndQuantities)
                    if(element.extraFields){
                        var ids = element.extraFields.map(e => e._id);
                        console.log(ids)
                        var res = product.extraFields.filter(item => ids.indexOf(item._id.toString()) > -1);
                                                        console.log(res);
                        if(res.length ===0) reject('Error creating shopping chart');          
                        product.extraFields.forEach(object => {
                            console.log(object._id)
                            var indexOfids = ids.indexOf(object._id.toString());
                            console.log(indexOfids)
                            if(indexOfids>-1 && object.values.includes(element.extraFields[indexOfids].value)){
                                if(element.extraFields[indexOfids].value === true){
                                        extras += element.quantity * object.extraPrice;
                                        console.log(extras)
                                }
                            }
                        })                            
                    }
                    
                    if(index === array.length-1) resolve();
                });
            })
            promiseForEach.then(()=>{
                var promise2 = new Promise((resolve, reject)=>{
                    productsFoundAndQuantities.forEach((element, index, array) =>{
                       if(element.product.stock - element.quantity<0 || element.product.maxOrder - element.quantity < 0){
                           reject('Please fill a valid quantity.');
                       }
                       subtotal += element.quantity*element.product.price;
                       if(index === array.length - 1) resolve();
                   })
                });
                promise2.then( async()=>{
                    var totalPrice = subtotal + extras;
                    const shoppingChartModel = new ShoppingChart({
                        user: id,
                        products,
                        subtotal,
                        extraPrice: extras,
                        totalPrice
                    });
                    const shoppingChart = await shoppingChartModel.save();
                    return res.status(200).send({message:'Shopping chart created successfully.', success: true, shoppingChart,date: Date()});
                }).catch((error)=>{
                    return res.status(500).send({message:'Error creating shopping chart', success: false, error, date: Date()});
                })
            }).catch( error => {
                return res.status(500).send({message:'Error creating shopping chart', success: false, error, date: Date()});
            });
        }else{
            try{
                const shoppingChartModel = new ShoppingChart({
                    user: id,
                    products,
                });
                const shoppingChart = await shoppingChartModel.save();
                return res.status(200).send({message:'Shopping chart created successfully.', success: true, shoppingChart,date: Date()});
            }catch(error){
                return res.status(500).send({message:'Error creating shopping chart', success: false, error, date: Date()});
            }
        }
}
//Eliminar el carrito de la persona logeada
async function deleteSgoppingChart(req ,res){
    try{
        const userId = req.userData.id;
        const shoppingChartDeleted = await ShoppingChart.findOneAndDelete({user: userId});
        if(!shoppingChartDeleted) return res.status(404).send({message:'No shopping chart found.', success: false, date: Date()});
        return res.status(200).send({message:'Shopping chart deleted successfully.', success: true, shoppingChartDeleted, date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error deleting shopping chart.', success: false, error, date: Date()});
    }
}
//Devuelve el carrito de la persona logeada
async function getShoppingChart(req, res){
    try{
        const user = req.userData.id;
        const shoppingChart = await ShoppingChart.findOne({user}).populate('products.product');
        if(!shoppingChart) return res.status(404).send({message:'No shopping chart found.', success: false, date: Date()});
        return res.status(200).send({message:'Shopping chart found successfully.', success: true, shoppingChart, date:Date()});
    }catch(error){
        return res.status(500).send({message:'Error finding shopping chart.', success: false, error, date: Date()});
    }
}
//Editar el carrtio, añadir o eliminar elemento
async function removeProducts(req,res){
    const { removeAllProducts} = req.body;
    const {id} = req.userData;
    const removeAllProductsQuery = removeAllProducts? {$unset:{products:1},$set:{subtotal: 0, extraPrice:0, totalPrice:0}} : {}
    try{
        const shoppingChart = await ShoppingChart.findOneAndUpdate({user: id}, {...removeAllProductsQuery},{new: true, runValidators: true});
        if(!shoppingChart) return res.status(404).send({message:'No shopping chart found.', success: false, date: Date()});
        return res.status(200).send({message:'Shopping chart updated successfully.', success: true, shoppingChart, date: Date()});
        }catch(error){
        return res.status(500).send({message:'Error updating shopping chart.', success: false, error: error.message, date: Date()});
    }
}
async function edit(req, res){
    const {id} = req.userData;
    const {products} = req.body;
    try{
        const shoppingChart = await ShoppingChart.findOne({user: id});
        const productsIdFromChart = await shoppingChart.products.map(e=> e.product);
        //Vienen del req.body
        if(products){
            products.forEach( object => {
                var promiseProductFound = new Promise( async (resolve, reject)=>{
                    var productFound = await Product.findOne({_id:object.product});
                    if(!productFound) reject('No product found');
                    resolve(productFound);
                })
                promiseProductFound.then(()=>{
                    if(productsIdFromChart.includes(object.product.toString())){
                        var index = productsIdFromChart.indexOf(object.product.toString());
                        
                        if(object.add){
                            shoppingChart.products[index].quantity += object.quantity;
                            shoppingChart.subtotal +=  object.quantity*shoppingChart.products[index].price;
                            if(object.extraFields.value === true){
    
                            }
                        }
                        if(object.remove){
                            shoppingChart.products[index].quantity -= object.quantity;
                            shoppingChart.subtotal -=  object.quantity*shoppingChart.products[index].price;
                        }
                    }
                    if(object.add){
                        delete object.add;
                        shoppingChart.products.push(object);
                        shoppingChart.subtotal += object.quantity;
                    }
                    if(object.remove){
                        delete object.remove;
                        shoppingChart.products.push(object);
                        shoppingChart.subtotal
                    }
                })
                
            })
        }
    }catch(error){
        return res.status(500).send({message:'Error updating shopping chart.', success: false, error: error.message, date: Date()});
    }
}
module.exports = {
    createShoppingChart,
    deleteSgoppingChart,
    getShoppingChart,
    removeProducts,
}