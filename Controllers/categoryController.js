const Category = require('../Models/item').category;
const Subcategory = require('../Models/item').subcategory;
const Product = require('../Models/item').product;

//For uploading photos
const {uploadSingleImage} = require('../Services/image');

function createCategory(req, res){
        const {name, description} = req.body;
        const category = new Category({
            name, 
            description
        });
        category.save((error, categorySaved)=>{
            if(error || !categorySaved)return res.status(400).send({message:'Bad request, please try again.', error, success: false});
            return res.status(200).send({message:'Category saved successfully.', category: categorySaved, success: true});
        });
}
//Devuelve todas las categorías y subcategorías
function getCategories(req, res){
    Category.find({}).populate('subcategories').then((categories)=>{
        if(!categories) return res.status(404).send({message:'No categories found.', success: true, date: Date()});
        return res.status(200).send({message:'Categories found successfully.', categories, success: true, date: Date()});
    }).catch((error)=>{
        return res.status(500).send({message:'Error finding categories.', success: false, error});
    })
}
//Devuelve una única categoría
async function getCategory(req, res){
    try{
        const {name, id} = req.body;
        const category = await Category.findOne({$or:[{'_id': id},{'name': name}]}).populate('subcategories');
        if(!category) return res.status(404).send({message:'No category found.', success: true, date: Date()});
        return res.status(200).send({message:'Category found successfully.', category, success: true, date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error finding category.', success: false, error});
    }

}
//Eliminar una categoría y subcategorías de la misma
async function deleteCategory(req,res){
    const {id} = req.body;
    var subcategoriesDeleted = []
    Category.findByIdAndDelete(id,async (err, categoryDeleted)=>{
        if(err || !categoryDeleted) return res.status(404).send({message:'No category found.', success: false, date: Date()});
        try {
            const productsUpdated1 = await Product.updateMany({category: id},{$unset:{category: 1}});
            if(categoryDeleted.subcategories){
                categoryDeleted.subcategories.forEach(async element => {
                    var subcategoryDeleted = await Subcategory.findOneAndDelete({_id: element});
                    var productsUpdated2 = await Product.updateMany({subcategory: element},{$unset:{subcategory: 1}});
                    subcategoriesDeleted.push(subcategoryDeleted);
                });
                return res.status(200).send({message:'Category and subcategories successfully deleted.', categoryDeleted, success: true, date: Date()});
            }
            return res.status(200).send({message:'Category deleted successfully.', categoryDeleted, success: true, date: Date()});
        } catch (error) {
                return res.status(500).send({message:'Error deleting subcategory.', success: false, error: error.message});
        }
    });
}
//Updatear una categoría
function updateCategory(req, res){
    const {id, name, description} = req.body;
    Category.findByIdAndUpdate(id,{$set:{name,description}},{new: true, runValidators: true}, (err, categoryUpdated)=>{
        if(err) return res.status(500).send({message:'Error updating user.', error: err, success: false, date: Date()});
        if(!categoryUpdated) return res.status(200).send({message:'No category found.', success: false, date: Date()});
        return res.status(200).send({message:'Category updated successfully.', success: true, categoryUpdated, date: Date()});
    })
}
//Updatear la foto de una categoría
async function updateImage(req, res){
    const {categoryId, path} = req.body;
    try{
        const imageUrl = await uploadSingleImage(req, res, path);        
        const category = await Category.findByIdAndUpdate(categoryId,{$set:{image:imageUrl}},{new: true});
        if(!category) return res.status(404).send({message:'No category found.', success: false, date: Date()});
        return res.status(200).send({message:'Category photo updated successfully.', category, success: true, date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error updating photo.', error:error.message, success: false})
    }
}


module.exports = {
    createCategory,
    getCategories,
    getCategory,
    deleteCategory,
    updateCategory,
    updateImage
}
