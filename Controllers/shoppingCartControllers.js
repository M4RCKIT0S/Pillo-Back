//Models
const ShoppingCart = require('../Models/shoppingCart');
const Product = require('../Models/item').product;

async function createShoppingCart(req, res){
        const {products} = req.body;
        /*{
            products:[{
                productId:Id del producto,
                quantity: cantidad,
                variant: Variante en caso de haber{
                    size, color, cualquier atributo necesario              
                }
            }]
        }*/
        const {id} = req.userData;
        var productsFoundVariantsAndQuantities = [];
        var subtotal = 0;
        var extras = 0;
        const findIfAlreadyHasOne = await ShoppingCart.findOne({user: id});
        if(findIfAlreadyHasOne) return res.status(400).send({message:'Bad request. This user already has one.', success: false, date: Date()});
        if(products){
            var promiseForEach = new Promise((resolve, reject) =>{
                products.forEach(async (element, index, array) => {
                    console.log(element)
                    try{
                        var product = await Product.findOne({_id: element.productId}).exec();
                    }catch(error){
                        reject(error);
                    }
                    console.log(product);
                    if(element.variant){
                        if(product.variants){
                            //para recorrer el array de variantes del producto
                            var found = false; var i =0;

                            while(i<product.variants.length && !found){
                                console.log(element.variant.color, product.variants[i].color)
                                if(element.variant.color=== product.variants[i].color &&
                                    element.variant.size === product.variants[i].size &&
                                    element.variant.cool === product.variants[i].cool &&
                                    element.variant.type === product.variants[i].type &&
                                    element.variant.dimension === product.variants[i].dimension &&
                                    element.variant.measure === product.variants[i].measure){
                                        found = true;
                                    }
                                    if(!found) i++;
                            }
                            if(found){
                                    if(product.variants[i].stock - element.quantity >=0 && product.maxOrder - element.quantity >=0){
                                        
                                        subtotal+= element.quantity*product.variants[i].price;
                                    }else{
                                        reject('No such quantity availeable.');
                                    }
                                }
                            }else{
                                reject('The variant for this object was not found');
                            }
                        }else{
                            if(product.stock - element.quantity >=0 && product.maxOrder - element.quantity >=0){
                                subtotal+= element.quantity*product.price;
                            }else{
                                reject('No such quantity availeable.');
                        }
                        }
                        if(index - products.length === -1){
                            resolve();
                        }
                })                           
                    
                });
                promiseForEach.then( async()=>{
                    var totalPrice = subtotal + extras;
                    const shoppingChartModel = new ShoppingCart({
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
                });
        }else{
            try{
                console.log('a')
                const shoppingChartModel = new ShoppingCart({
                    user: id,
                    products,
                    subtotal
                });
                const shoppingChart = await shoppingChartModel.save();
                return res.status(200).send({message:'Shopping chart created successfully.', success: true, shoppingChart,date: Date()});
            }catch(error){
                return res.status(500).send({message:'Error creating shopping chart', success: false, error, date: Date()});
            }
        }
}
//Eliminar el carrito de la persona logeada
async function deleteShoppingCart(req ,res){
    try{
        const userId = req.userData.id;
        const shoppingChartDeleted = await ShoppingCart.findOneAndDelete({user: userId});
        if(!shoppingChartDeleted) return res.status(404).send({message:'No shopping chart found.', success: false, date: Date()});
        return res.status(200).send({message:'Shopping chart deleted successfully.', success: true, shoppingChartDeleted, date: Date()});
    }catch(error){
        return res.status(500).send({message:'Error deleting shopping chart.', success: false, error, date: Date()});
    }
}
//Devuelve el carrito de la persona logeada
async function getShoppingCart(req, res){
    try{
        const user = req.userData.id;
        const shoppingChart = await ShoppingCart.findOne({user}).populate('products.productId');
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
    const removeAllProductsQuery =  {$unset:{products:1},$set:{subtotal: 0, extraPrice:0, totalPrice:0}};
    try{
        const shoppingChart = await ShoppingCart.findOneAndUpdate({user: id}, {...removeAllProductsQuery},{new: true, runValidators: true});
        if(!shoppingChart) return res.status(404).send({message:'No shopping chart found.', success: false, date: Date()});
        return res.status(200).send({message:'Shopping chart updated successfully.', success: true, shoppingChart, date: Date()});
        }catch(error){
        return res.status(500).send({message:'Error updating shopping chart.', success: false, error: error.message, date: Date()});
    }
}
async function edit(req, res){
    const {id} = req.userData;
    const {addProducts, removeProducts} = req.body;
    try{
        var subtotal = 0;
        var shoppingChart = await ShoppingCart.findOne({user: id});
        if(!shoppingChart) return res.status(404).send({message:'This user doesn´t have a shopping chart.', success: false, date: Date()});
        var addPromise = new Promise(async (resolve, reject)=>{
            if(addProducts){
                addProducts.forEach(async(obj, index)=>{
                    var productId = obj.productId;
                    let product = await Product.findOne({_id: productId}).exec();
                    let queryPush = {};
                    let querySet = {};
                    if(product.variants && obj.variant){
                      //para recorrer el array de variantes del producto
                      var found = false;
                      var i = 0;
                      while (i < shoppingChart.products.length && !found) {
                          //Se comprueba si está en el producto esa variante y luego se comprueba si está o no en el carrito
                          //dividir querys de añadir uno nuevo o uno ya existente
                          console.log(i)
                        if(shoppingChart.products[i].variant &&
                          obj.variant.color === shoppingChart.products[i].variant.color &&
                          obj.variant.size === shoppingChart.products[i].variant.size &&
                          obj.variant.cool === shoppingChart.products[i].variant.cool &&
                          obj.variant.type === shoppingChart.products[i].variant.type &&
                          obj.variant.dimension === shoppingChart.products[i].variant.dimension &&
                          obj.variant.measure === shoppingChart.products[i].variant.measure) {
                          found = true;
                        }
                        if (!found) i++;
                      }
                      
                      console.log(found)
                      if (found) {
                        if (product.variants[i].stock - (obj.quantity + shoppingChart.products[i].quantity) >= 0 && product.maxOrder - (obj.quantity + shoppingChart.products[i].quantity )>= 0) {
                          subtotal = shoppingChart.subtotal + obj.quantity * product.variants[i].price;
                          let pos2 = `products.${i}.quantity`;
                            console.log(pos2);
                            querySet[pos2] = shoppingChart.products[i].quantity + obj.quantity;
                            console.log(querySet);
                        } else {
                          reject("No such quantity availeable.");
                        }
                      }else{
                          var x =0;
                          var encontrado = false;
                          while(x< product.variants.length && !encontrado){
                            if(
                                obj.variant.color === product.variants[x].color &&
                                obj.variant.size === product.variants[x].size &&
                                obj.variant.cool === product.variants[x].cool &&
                                obj.variant.type === product.variants[x].type &&
                                obj.variant.dimension === product.variants[x].dimension &&
                                obj.variant.measure === product.variants[x].measure) {
                                encontrado = true;
                              }
                              if(!encontrado )x++
                          }
                          if(encontrado){
                              if(product.variants[i].stock - obj.quantity >= 0 && product.maxOrder - obj.quantity >= 0){
                                  queryPush = {...queryPush, products: obj};
                                  subtotal = shoppingChart.subtotal + obj.quantity * product.variants[x].price;
                              }else{
                                  reject('No such quantity availeable.');
                              }
                          }else{
                              reject('No se ajusta a ninguna variante.');
                          }
                      }
                    }else{     
                        var j =0;
                        var found2 = false;
                        while( j < shoppingChart.products.length && !found2){
                            if(obj.productId == shoppingChart.products[j].productId ){
                                    found2 = true;
                                }
                            if(!found2) j++;
                        } 
                        if(found2){
                            if(product.stock - obj.quantity >=0 && product.maxOrder - (obj.quantity+ shoppingChart.products[j].quantity) >=0){
                                subtotal = shoppingChart.subtotal+ obj.quantity*product.price;
                                    let pos2 = `products.${i}.quantity`;
                                    console.log(pos2);
                                    querySet[pos2] = shoppingChart.products[index].quantity  + obj.quantity;
                            }else{
                                reject('No such quantity availeable.');
                            }
                        }   else{
                            console.log(product.stock, obj.quantity, product.maxOrder)
                            if(product.stock - obj.quantity >=0 && product.maxOrder - obj.quantity >=0){
                                subtotal = shoppingChart.subtotal+ obj.quantity*product.price;
                                queryPush = {...queryPush, products: obj};
                            }else{
                                reject('No such quantity availeable.x');
                            }
                        }               
                        
                    }
                    if(index - addProducts.length === -1){
                        console.log(querySet, queryPush)
                        resolve({$push: queryPush, $set: {...querySet, subtotal: subtotal}});
                    }
                })
            }else{
                resolve(null);
            }
        });
        var removePromise = new Promise(async (resolve, reject)=>{
            if(removeProducts){
                removeProducts.forEach(async (element, index)=>{
                    let querySet = {};
                    let queryPull = {};
                    let product = await Product.findOne({_id: element.productId}).exec();
                    if(element.variant ) console.log(element)
                        //para recorrer el array de variantes de productos del carrito
                        if(shoppingChart.products && element.variant){
                        var found = false;
                        var i = 0;
                        while (i < shoppingChart.products.length && !found) {
                          if (
                              shoppingChart.products[i].variant &&
                            element.variant.color === shoppingChart.products[i].variant.color &&
                            element.variant.size === shoppingChart.products[i].variant.size &&
                            element.variant.cool === shoppingChart.products[i].variant.cool &&
                            element.variant.type === shoppingChart.products[i].variant.type &&
                            element.variant.dimension === shoppingChart.products[i].variant.dimension &&
                            element.variant.measure === shoppingChart.products[i].variant.measure) {
                            found = true;
                          }
                          if (!found) i++;
                        }
                        if (found) {
                            var isInVariants = false, positionInVariant =0;
                            while(!isInVariants && positionInVariant<product.variants.length){
                                if (
                                product.variants && 
                                  element.variant.color === product.variants[positionInVariant].color &&
                                  element.variant.size === product.variants[positionInVariant].size &&
                                  element.variant.cool === product.variants[positionInVariant].cool &&
                                  element.variant.type === product.variants[positionInVariant].type &&
                                  element.variant.dimension === product.variants[positionInVariant].dimension &&
                                  element.variant.measure ===  product.variants[positionInVariant].measure) {
                                  isInVariants = true;
                                }
                                if(!isInVariants) positionInVariant++;
                            }
                            if(!isInVariants) reject('No variant matches the given one.');
                            if(shoppingChart.products[i].quantity - element.quantity>0){
                                let pos1 = `products.${i}.quantity`;
                                console.log(pos1);
                                querySet[pos1] = shoppingChart.products[i].quantity - element.quantity;
                            }
                            else{
                                queryPull = {...queryPull, products:element}
                            }
                            //console.log(positionInVariant,product, product.variants[positionInVariant])
                            //console.log(shoppingChart.subtotal,product.variants[positionInVariant].price, product.variants[positionInVariant].price*removeProducts[index].quantity,shoppingChart.subtotal - product.variants[positionInVariant].price*removeProducts[index].quantity)
                            querySet = {...querySet, subtotal: shoppingChart.subtotal - product.variants[positionInVariant].price*removeProducts[index].quantity, totalPrice: shoppingChart.totalPrice - product.variants[positionInVariant].price*removeProducts[index].quantity}
                        }else{
                            reject('No variant found for this object.')
                        }
    
                    }else{
                        //cambiar, compararIds
                        var e = 0, found3 = false;
                        while(!found3 && e<shoppingChart.products.length){
                            if(shoppingChart.products[e].productId == element.productId) found3 = true;
                            if(!found3) e++;
                        }
                        if(found3){
                            if (shoppingChart.products[e].quantity - element.quantity >0) {
                                let pos2 = `products.${e}.quantity`;
                                console.log(pos2);
                                querySet[pos2] = shoppingChart.products[e].quantity - element.quantity;
                              } else {
                                queryPull = {...queryPull, products: element};
                              }
                              console.log(shoppingChart.subtotal, element.quantity, product)
                              if(shoppingChart.products[e].quantity - element.quantity <0){
                                  querySet = {...querySet, subtotal: shoppingChart.subtotal - shoppingChart.products[e].quantity*product.price};
                                  object = {productId: element.productId, quantity: shoppingChart.products[e].quantity};
                                  queryPull = {...queryPull, products: object};
                              }else{
                                  querySet = {...querySet, subtotal: shoppingChart.subtotal- element.quantity*product.price}
                              }
                        }
                    }
                    if(index - removeProducts.length === -1){
                        let finalQuery = {$set: querySet, $pull: queryPull};
                        console.log(finalQuery);
                        resolve(finalQuery);
                    }
                })
            }else{
                resolve(null);
            }
        });
        const queryAdd = await addPromise;
        var shoppingChartUpdated1, shoppingChartUpdated2;
        if(queryAdd) {
            console.log('query: '+queryAdd, subtotal)
            shoppingChartUpdated1 = await ShoppingCart.findOneAndUpdate({user: id},{...queryAdd},{new: true});
            shoppingChart = shoppingChartUpdated1;
        }
        const queryRemove = await removePromise;
        if(queryRemove) shoppingChartUpdated2 = await ShoppingCart.findOneAndUpdate({user: id},{...queryRemove},{new: true});
        if(!shoppingChartUpdated1 && !shoppingChartUpdated2) return res.status(404).send({message:'No shopping chart updated.', success: false});
        if(shoppingChartUpdated2) return res.status(200).send({message:'Shopping chart updated successfully.', success: true, shoppingChart: shoppingChartUpdated2});
        return res.status(200).send({message:'Shopping chart updated succesfully.', success: true, shoppingChart: shoppingChartUpdated1});
    }catch(error){
        console.log(error)
        return res.status(500).send({message:'Error updating shopping chart.', success: false, error: error, date: Date()});
    }
}
module.exports = {
    createShoppingCart,
    deleteShoppingCart,
    getShoppingCart,
    removeProducts,
    edit
}