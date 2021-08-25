//Models
const ShoppingChart = require('../Models/shoppingChart');
const Product = require('../Models/item').product;

async function createShoppingChart(req, res){
        const {products} = req.body;
        const {id} = req.userData;
        var productsFoundAndQuantities = [];
        var subtotal = 0;
        const findIfAlreadyHasOne = await ShoppingChart.findOne({user: id});
        if(findIfAlreadyHasOne) return res.status(400).send({message:'Bad request. This user already has one.', success: false, date: Date()});
        if(products){
            var promiseForEach = new Promise((resolve, reject) =>{
                products.forEach(async (element, index, array) => {
                    console.log(element)
                    var product = await Product.findOne({_id: element.product});
                    productsFoundAndQuantities.push({product, quantity: element.quantity});
                    console.log(productsFoundAndQuantities)
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
                    console.log('aaa')
                    const shoppingChartModel = new ShoppingChart({
                        user: id,
                        products,
                        totalPrice: subtotal
                    });
                    const shoppingChart = await shoppingChartModel.save();
                    return res.status(200).send({message:'Shopping chart created successfully.', success: true, shoppingChart,date: Date()});
                }).catch((error)=>{
                    return res.status(500).send({message:'Error creating shopping chart', success: false, error, date: Date()});
                })
            });
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
        const shoppingChart = await ShoppingChart.findOne({user});
        if(!shoppingChart) return res.status(404).send({message:'No shopping chart found.', success: false, date: Date()});
        return res.status(200).send({message:'Shopping chart found successfully.', success: true, shoppingChart, date:Date()});
    }catch(error){
        return res.status(500).send({message:'Error finding shopping chart.', success: false, error, date: Date()});
    }
}
module.exports = {
    createShoppingChart,
    deleteSgoppingChart,
    getShoppingChart
}