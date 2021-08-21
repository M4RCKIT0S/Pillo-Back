const Subcategory = require('../Models/item').subcategory;
const Category = require('../Models/item').category;

async function createSubcategory(req, res){
    try{
        const {categoryId, name} = req.body;
        const category = await  Category.findById(categoryId);
        if(!category) return res.status(404).send({message:'Category Id is not valid. Change it and try again.', success: false, status:404});
        const subcategory = new Subcategory({
            name,
            upperCategory: categoryId
        });
        const subcategorySaved = await subcategory.save();
        const categoryUpdated = await Category.findOneAndUpdate({_id: categoryId},{$push:{subcategories: subcategorySaved._id}},{new: true, runValidators: true});
        return res.status(200).send({message:'Subcategory successfully created', subcategory: subcategorySaved,category: categoryUpdated});
    }catch(error){
        return res.status(400).send({message:'Error creating subcategory.', error: error.message, success: false, date:Date()});
    }

}
//Obtener todas las subcategorías
async function getAllSubcategories(req, res){
    try{
        const subcategories = await Subcategory.find({}).populate('upperCategory');
        if(!subcategories) return res.status(404).send({message:'No subcategories found.', success: true, date: Date()});
        return res.status(200).send({message:'Subcategories found successfully.', subcategories, success: true, date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error getting subcategories.', success: false, error: error.message});
    }
}
//Obtener una categoría por nombre o
async function getSubcategory(req, res){
    try{
        const {name, id} = req.body;
        const subcategory = await Subcategory.findOne({$or:[{'_id':id},{'name': name} ]});
        if(!subcategory) return res.status(404).send({message:'No subcategory found', success: false, date: Date()}); 
        return res.status(200).send({message:'Subcategory found successfully.', subcategory, success: true , date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error finding subcategory.', error: error.message, success: false, date: Date()});
    }
}
//Eliminar una subcategoría
function deleteSubcategory(req, res){
    const {id} = req.body;
    Subcategory.findByIdAndDelete(id, async (err, subcategoryDeleted)=>{
        if(err) return res.status(500).send({message:'Internal server error.', success: false, date: Date()});
        if(!subcategoryDeleted) return res.status(404).send({message:'No subcategory found.', success: false, date: Date()});
        const category = await Category.findByIdAndUpdate(subcategoryDeleted.upperCategory,{$pull:{subcategories: id}},{new: true, runValidators: true});
        return res.status(200).send({message:'Subcategory deleted successfully.', success: true, subcategoryDeleted,category,date: Date()});
    }) 
}
async function updateSubcategory (req,res){
    try {
        const {id, name,categoryId,oldCategoryId} = req.body;
        const subcategory = await Subcategory.findByIdAndUpdate(id,{$set:{name, upperCategory:categoryId}}, {new: true, runValidators: true});
        if(!subcategory) return res.status(404).send({message:'Subcategory not found.', success: false, date: Date()});
        if(categoryId != oldCategoryId){
            const oldCategory = await Category.findByIdAndUpdate(oldCategoryId,{$pull:{subcategories: id}},{new: true, runValidators: true});
            const newCategorie = await Category.findByIdAndUpdate(categoryId,{$push:{subcategories: id}},{new: true, runValidators: true});
            return res.status(200).send({message:'', success: true, subcategory,newCategorie,oldCategory,date: Date()})

        }
        return res.status(200).send({message:'', success: true, subcategory, date: Date()})

    } catch (error) {
        return res.status(500).send({message: 'Error updating subcategory.', error, success: false, date: Date()});
    }
}
module.exports = {
    createSubcategory,
    getAllSubcategories,
    getSubcategory,
    deleteSubcategory,
    updateSubcategory
}