const Product = require('../Models/item').product;
const Category = require('../Models/item').category;
const Subcategory = require('../Models/item').subcategory;
const Shop = require('../Models/shop');

const {uploadMultipleImages} = require('../Services/image')
const {deleteImage} = require('../Services/image')

async function createProduct(req, res){
    try{
    const {name, description, price, stock, maxOrder, category, subcategory, shop, labels, extraFields, variants} = req.body;
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
        extraFields,
        variants
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
        let products = await Product.find({}).populate([{path:"uploadedBy",select:"email"},{path:"category",select:"name"},{path:"subcategory",select:"name"},{path:"shop",select:"name"}]);
        if(!products) return res.status(404).send({message:'No products found.', products, success: true, date: Date() });
        return res.status(200).send({message:'Products found successfully.', products, success: true, date: Date()});
    } catch (error) {
        return res.status(500).send({message:'Error finding products. Try again.', success: false , date: Date()});
    }
}
//Devolver un producto en concreto
async function getProduct(req, res){
    try{
        const {id} = req.body;
        const product = await Product.findOne({_id: id}).populate([{path:"uploadedBy",select:"email"},{path:"category",select:"name"},{path:"subcategory",select:"name"},{path:"shop",select:"name"}]);;
        if(!product) return res.status(404).send({message:'Product not found.', success: false, date: Date()});
        return res.status(200).send({message:'Product found successfully.', product, success: true, date:Date()});
    }catch(error){
        return res.status(200).send({message:'Error finding product.', success: false, error, date: Date()});
    }
}
//Eliminar un producto
async function deleteProduct(req, res){
    try {
        const {id} = req.body;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if(!deletedProduct) return res.status(404).send({message:'No product found, couldn´t delete it.', success: false, date: Date()});
        const updatedCategory = await Category.findOneAndUpdate({_id: deletedProduct.category},{$pull:{products: id}},{new: true});
        const updatedSubcategory = await Subcategory.findOneAndUpdate({_id: deletedProduct.subcategory},{$pull:{products: id}},{new: true});
        const updatedShop = await Shop.findOneAndUpdate({_id: deletedProduct.shop},{$pull:{products: id}},{new: true});
        return res.status(200).send({message:'Product deleted successfully.',success: true, deletedProduct, updatedCategory, updatedSubcategory, updatedShop, date: Date()});
    } catch (error) {
        return res.status(500).send({message:'Error deleting product.', success: false, error, date: Date()});
    }
}


const parseImageLinkName = (link,productName) =>{
    let parsedImage = null
    let index = link.indexOf(productName)
    if(index !== -1){
      parsedImage = link.substring(index+productName.length+1)
    }

    return parsedImage
}

//Editar un producto, Todo(testear)
async function updateProduct(req, res){
    try{
        const {productId, oldCategory,newCategory, oldSubcategory,newSubcategory, oldShop, newShop, removeImage, path} = req.body;
        var querySet = {};
        var arrayFilters = [];
        var keys = Object.keys(req.body);
        const values = Object.values(req.body);
        for(var i=0;i<keys.length;i++){
            if(keys[i] !== "productId" &&
                keys[i] !=="oldCategory" &&
                keys[i] !=="newCategory" &&
                keys[i] !== "oldSubcategory" &&
                keys[i] !== "newSubcategory" &&
                keys[i] !== "oldShop" && 
                keys[i] !== "newShop"){
                    querySet[keys[i]] = values[i];
                }
        } 
        //const addLabelQuery = addLabel ? {labels: addLabel} : {};
        //const removeLabelQuery = removeLabel ? {labels: removeLabel} : {};
        //const addExtraFieldQuery = addExtrafield ? {extraFields: addExtrafield} : {};
        //Para el objeto de extraField entero
        //const removeExtraFieldQuery = removeExtraFieldId ? {extraFields:{_id: removeExtraFieldId}} : {};
        //Para valores internos del extraField
        //const addValuesToExtrafield = addExtraFieldValue ? ({'extraFields.$[extrafield].values': addExtraFieldValue}, arrayFilters.length==0? arrayFilters = [{'extraField._id': extraFieldId}] : null ) : {};
        //const removeValueFromExtraField = removeExtraFieldValue ? ({'extraFields.$[extrafield].values': removeExtraFieldValue},
        //                                                                arrayFilters.length==0? arrayFilters = [{'extraField._id': extraFieldId}] : null ): {};
        //var addQuery = {...addLabelQuery, ...addExtraFieldQuery, ...addValuesToExtrafield};
        //var removeQuery = { ...removeLabelQuery, ...removeExtraFieldQuery, ...removeValueFromExtraField};
        //console.log(removeQuery)
        var removeImageQuery = removeImage && req.body.name? {$pull:{images:{$in: removeImage}}}: {};
        if(removeImage&&req.body.name){
            removeImage.forEach(async element => {
                try{
                    await deleteImage(`products/${req.body.name}/${parseImageLinkName(element, req.body.name)}`);
                }catch(err){
                    console.log(err);
                }
            });
        }
        var unsetQuery = {}
        if(oldCategory != newCategory) {
            const categoryProductRemoved = await Category.findOneAndUpdate({_id: oldCategory}, {$pull:{products: productId}}, {new: true});
            if(newCategory==="") unsetQuery = {...unsetQuery, category: 1};
            if(newCategory) {
                querySet = {...querySet, category: newCategory};

                var categoryProductAdded = await Category.findOneAndUpdate({_id: newCategory}, {$push:{products: productId}}, {new: true});
            }
        }
        if(oldSubcategory != newSubcategory) {
            const subcategoryProductRemoved = await Subcategory.findOneAndUpdate({_id: oldSubcategory}, {$pull:{products: productId}}, {new: true});
           if(newSubcategory==="") unsetQuery = {...unsetQuery, subcategory: 1};
            if(newSubcategory){
                querySet = {...querySet, subcategory: newSubcategory};
                var subcategoryProductAdded = await Subcategory.findOneAndUpdate({_id: newSubcategory}, {$push:{products: productId}}, {new: true});
            } 
        }
        if(oldShop != newShop) {
            const shopProductRemoved = await Shop.findOneAndUpdate({_id: oldShop}, {$pull:{products: productId}}, {new: true});
            if(newShop==="") unsetQuery = {...unsetQuery, shop:1} ;
            if(newShop){
                querySet = {...querySet, shop: newShop};
                var shopProductAdded = await Shop.findOneAndUpdate({_id: newShop}, {$push:{products: productId}}, {new: true});
            } 
        }
        console.log(querySet)
        const updatedProduct = await Product.findOneAndUpdate({_id: productId},{$set:querySet,  ...removeImageQuery,$unset: unsetQuery},{new: true});
        if(!updatedProduct) return res.status(404).send({message:'Product not found.', success: false, date: Date()});
        return res.status(200).send({message:'Product updated successfully.', success: true, updatedProduct, date: Date()});
    }catch(error){
        console.log(error)
        return res.status(500).send({message:'Error updating product.', success: false, error: error.message,date: Date()});
    }
}


async function updateImages(req, res){
    const { productId, path } = req.body;
    try{
        const images = await uploadMultipleImages(req.files, path);
        const product = await Product.findByIdAndUpdate(productId,{$addToSet:{images:images}},{new: true});
        if(!product) return res.status(404).send({message:'No product found.', success: false, date: Date()});
        return res.status(200).send({message:'Product photos updated successfully.', product, success: true, date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error updating photo.', error, success: false})
    }
}


module.exports = {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct,
    updateImages,
}