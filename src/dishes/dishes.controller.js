const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

const idMatchRoute = require("../utils/idMatchRoute");


// TODO: Implement the /dishes handlers needed to make the tests pass


function list(req, res){
    res.json({data: dishes})
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      if(data[propertyName] !== ""){
        return next();
      }
    }
    next({ status: 400, message: `Dish must include a ${propertyName}` });
  };
}

function validPrice(req, res, next){
    const { data : { price } = {} } = req.body;
    if(price > 0 && Number.isInteger(price)){
        return next();
    }
    next({status: 400, message: `Dish must have a price that is an integer greater than 0`})
}

function create(req, res){
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(), 
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    }
    dishes.push(newDish);
    res.status(201).json({data: newDish});
}

function dishExists(req, res, next){
    const dishId = req.params.dishId;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if(foundDish){
        res.locals.dish = foundDish;
        return next();
    }
    next({status: 404, message: `Dish does not exist: ${dishId}.`});
}

function read(req, res){
    res.json({data: res.locals.dish});
}

function update(req, res){
    const dish = res.locals.dish;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({data: dish});
}

module.exports = {
    list,
    create: [
        bodyDataHas("description"),
        bodyDataHas("name"),
        bodyDataHas("price"),
        validPrice,
        bodyDataHas("image_url"),
        create
    ],
    read: [
        dishExists,
        read,
    ],
    update: [
        dishExists,
        bodyDataHas("description"),
        bodyDataHas("name"),
        bodyDataHas("price"),
        validPrice,
        bodyDataHas("image_url"),
        idMatchRoute,
        update,
    ],
}