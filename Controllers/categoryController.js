const Category = require('../Models/item').category;

async function createCategory(req, res){
    try{
        const {isNew, name, description} = req.body;
        //Comprobamos que sea un string, se podría hacer un JSON.parse
        if(isNew === "true" || isNew === "false"){
                const category = new Category({
                    name,
                    description
                });
                categorySaved = await category.save();
        //Si es nuevo se guarda en la db
        if(isNew==="true"){
            return res.status(200).send({message:'category saved successfully.', category: categorySaved, status:200});
        //Si no es nuevo se guarda y se updatea el padre
        }else if(isNew === "false"){
            const {categoryId} = req.query;
            const upperCategory = await  Category.findOneAndUpdate({_id: categoryId},{$push:{subcategories: category}},{new: true});
            return res.status(200).send({message:'Subcategory successfully created', fatherCategory: upperCategory,categorySaved});
        }else return  res.status(400).send({message:'Bad request, please make some changes and try again.', success: false, date: Date()});
        }
    }catch(error){
        return res.status(599).send({message:'Internal server error.', error: error.message, success: false, date:Date()});
    }
}

module.exports = {
    createCategory,
}
