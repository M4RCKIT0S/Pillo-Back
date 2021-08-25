//Models
const ShoppingChart = require('../Models/shoppingChart');

async function createShoppingChart(req, res){
    try{
        const {products} = req.body;
        const {id} = req.userData;

        const findIfAlreadyHasOne = await ShoppingChart.findOne({user: id});
        if(findIfAlreadyHasOne) return res.status(400).send({message:'Bad request. This user already has one.', success: false, date: Date()});
        const shoppingChartModel = new ShoppingChart({
            user: id,
            products
        });
        const shoppingChart = await shoppingChartModel.save();
        return res.status(200).send({message:'Shopping chart created successfully.', success: true, shoppingChart,date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error creating shopping chart', success: false, error, date: Date()});
    }
}

module.exports = {
    createShoppingChart
}