const Product = require('../Models/item').product;
const Category = require('../Models/item').category;
const Subcategory = require('../Models/item').subcategory;
const Shop = require('../Models/shop');

async function createProduct(req, res){
    try{
    const {name, description, price, stock, maxOrder, category, subcategory, shop, labels, extrafields} = req.body;
    const uploadedBy = req.userData.id;
    const product = new Product({
        name,
        description,
        price,
        stock,
        uploadedBy,
        maxOrder,
        category,
        subcategory,
        shop,
        labels,
        extrafields
    });
        const categoryFound = await Category.findOne({_id: category});
        if((!categoryFound.subcategories || categoryFound.subcategories.length == 0) && subcategory){
            return res.status(400).send({message:'Bad request, please try again.', success: false, status: 400, date: Date()});
        }
        if(!categoryFound.subcategories.includes(subcategory)){
            return res.status(400).send({message:'Bad request, please try again.', success: false, status: 400, date: Date()});
        }
        const productSaved = await product.save();
        categoryFound.products.push(productSaved._id);
        const categorySaved = await categoryFound.save();
        const subcategoryUpdated = await Subcategory.findByIdAndUpdate(subcategory, {$push:{products:productSaved._id}},{new: true, runValidators: true});
        const shopUpdated = await Shop.findByIdAndUpdate(shop,{$push:{products:productSaved._id}},{new: true, runValidators: true});
        return res.status(200).send({message: 'Product saved succesfully.',success: true,product: productSaved, categoryUpdated: categorySaved, subcategoryUpdated, shopUpdated})
    }catch(error){
        return res.status(500).send({message:'Error saving product.', error: error.message});
    }
}
//Devuelve todos los productos
async function getProducts(req, res){
    try {
        const products = await Product.find({});
        if(!products) return res.status(404).send({message:'No products found.', products, success: true, date: Date() });
        return res.status(200).send({message:'Products found successfully.', products, success: true, date: Date()});
    } catch (error) {
        return res.status(500).send({message:'Error finding products. Try again.', success: false , date: Date()});
    }
}
//Devolver un producto en concreto
async function getProduct(req, res){
    try{
        const {productId} = req.body;
        const product = await Product.findOne({_id: productId});
        if(!product) return res.status(404).send({message:'Product not found.', success: false, date: Date()});
        return res.status(200).send({message:'Product found successfully.', product, success: true, date:Date()});
    }catch(error){
        return res.status(200).send({message:'Error finding product.', success: false, error, date: Date()});
    }
}
//Eliminar un producto
async function deleteProduct(req, res){
    try {
        const {productId} = req.body;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if(!deletedProduct) return res.status(404).send({message:'No product found, couldn´t delete it.', success: false, date: Date()});
        const updatedCategory = await Category.findOneAndUpdate({_id: deletedProduct.category},{$pull:{products: productId}},{new: true});
        const updatedSubcategory = await Subcategory.findOneAndUpdate({_id: deletedProduct.subcategory},{$pull:{products: productId}},{new: true});
        const updatedShop = await Shop.findOneAndUpdate({_id: deletedProduct.shop},{$pull:{products: productId}},{new: true});
        return res.status(200).send({message:'Product deleted successfully.',success: true, deletedProduct, updatedCategory, updatedSubcategory, updatedShop, date: Date()});
    } catch (error) {
        return res.status(500).send({message:'Error deleting product.', success: false, error, date: Date()});
    }
}
//Editar un producto, Todo(testear)
async function updateProduct(req, res){
    try{
        const {productId, oldCategory,newCategory, oldSubcategory,newSubcategory, oldShop, newShop, addExtrafield, extraFieldId, removeExtraFieldId, addLabel, removeLabel, addExtraFieldValue, removeExtraFieldValue} = req.body;
        var querySet = {};
        var arrayFilters = [];
        var keys = Object.keys(req.body);
        const values = Object.values(req.body);
        console.log(keys)
        for(var i=0;i<keys.length;i++){
            if(keys[i] == "name" ||
                keys[i] ==  "description" ||
                keys[i] == "price"||
                keys[i] == "stock" ||
                keys[i] == "maxOrder" ||
                keys[i] == "active"){
                    querySet[keys[i]] = values[i];
                }
            if(keys[i] == "extraFieldName" || 
                keys[i] == "extraFieldDescription" ||
                keys[i] == "extraFieldExtraPrice"
            ){
                var value = keys[i];
                switch(value){
                    case "extraFieldName": value = 'name';
                    break;
                    case "extraFieldDescription": value = 'description';
                    break;
                    case "extraFieldExtraPrice": value = 'extraPrice';
                    default: value = '';
                    break;
                }
                var queryExtraField = 'extraFields.$[extraField].' + value;
                querySet[queryExtraField] = values[i]; 
                arrayFilters = [{'extraField._id': extraFieldId}];
            }
        } 
        console.log(querySet)
        const addLabelQuery = addLabel ? {labels: addLabel} : {};
        const removeLabelQuery = removeLabel ? {labels: removeLabel} : {};
        const addExtraFieldQuery = addExtrafield ? {extraFields: addExtrafield} : {};
        //Para el objeto de extraField entero
        const removeExtraFieldQuery = removeExtraFieldId ? {extraFields:{_id: removeExtraFieldId}} : {};
        //Para valores internos del extraField
        const addValuesToExtrafield = addExtraFieldValue ? ({'extraFields.$[extrafield].values': addExtraFieldValue}, arrayFilters.length==0? arrayFilters = [{'extraField._id': extraFieldId}] : null ) : {};
        const removeValueFromExtraField = removeExtraFieldValue ? ({'extraFields.$[extrafield].values': removeExtraFieldValue},
                                                                        arrayFilters.length==0? arrayFilters = [{'extraField._id': extraFieldId}] : null ): {};
        var addQuery = {...addLabelQuery, ...addExtraFieldQuery, ...addValuesToExtrafield};
        var removeQuery = { ...removeLabelQuery, ...removeExtraFieldQuery, ...removeValueFromExtraField};
        console.log(removeQuery)
        if(oldCategory != newCategory) {
            querySet = {...querySet, category: newCategory};
            const categoryProductRemoved = await Category.findOne({_id: oldCategory}, {$pull:{products: productId}}, {new: true});
            const categoryProductAdded = await Category.findOne({_id: newCategory}, {$push:{products: productId}}, {new: true});
        }
        if(oldSubcategory != newSubcategory) {
            querySet = {...querySet, subcategory: newSubcategory};
            const subcategoryProductRemoved = await Subcategory.findOne({_id: oldSubcategory}, {$pull:{products: productId}}, {new: true});
            const subcategoryProductAdded = await Subcategory.findOne({_id: newSubcategory}, {$push:{products: productId}}, {new: true});
        }
        if(oldShop != newShop) {
            querySet = {...querySet, shop: newShop};
            const shopProductRemoved = await Shop.findOne({_id: oldShop}, {$pull:{products: productId}}, {new: true});
            const shopProductAdded = await Shop.findOne({_id: newShop}, {$push:{products: productId}}, {new: true});
        }
        const updatedProduct = await Product.findOneAndUpdate({_id: productId},{$set:querySet, $push: addQuery, $pull:removeQuery},{arrayFilters, new: true});
        if(!updatedProduct) return res.status(404).send({message:'Product not found.', success: false, date: Date()});
        return res.status(200).send({message:'Product updated successfully.', success: true, updatedProduct, date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error updating product.', success: false, error: error.message,date: Date()});
    }
}
module.exports = {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct
}