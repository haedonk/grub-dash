const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const bodyDataHas = require("../utils/bodyDataHas");

const idMatchRoute = require("../utils/idMatchRoute");
const { deserialize } = require("v8");
const { del } = require("express/lib/application");


// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res){
    res.json({data: orders});
}

function create(req, res){
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = res.locals.order;
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes,
    }
    orders.push(newOrder);
    res.status(201).json({data: newOrder});
}

function dishesIsArray(req, res, next){
    res.locals.order = req.body;
    const dishes = res.locals.order.data.dishes;
    if(Array.isArray(dishes) && dishes.length > 0){
        return next();
    }
    next({status: 400, message: `Order must include at least one dish`});
}

function validQuantity(req, res, next){
    const dishes = res.locals.order.data.dishes;
    dishes.forEach((dish, index) => {
        if(!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)){
            return next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`});
        }
    })
    next();
}

function read(req, res){
    res.json({data: res.locals.foundOrder});
}

function orderExists(req, res, next){
    const orderId = req.params.orderId;
    const foundOrder = orders.find(order => order.id === orderId)
    if(foundOrder){
        res.locals.foundOrder = foundOrder;
        return next();
    }
    next({status: 404, message: `Order ${orderId} not found`});
}

function update(req, res){
    const order = res.locals.foundOrder;
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({data: order});
}

function validStatus(req, res, next){
    if(!req.body.data.status || req.body.data.status === "" || req.body.data.status === "invalid"){
        return next({status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered`})
    }
    if(req.body.data.status === "delivered"){
        return next({status: 400, message: `A delivered order cannot be changed`})
    }
    next();
}

function destroy(req, res){
    const orderId = res.locals.foundOrder.id;
    const index = orders.findIndex(order => order.id === orderId);
    orders.splice(index, 1);
    res.sendStatus(204);
}

function pendingDelete(req, res, next){
    const status = res.locals.foundOrder.status;
    if(status !== "pending"){
        return next({status: 400, message: `An order cannot be deleted unless it is pending`});
    }
    next();
}

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        dishesIsArray,
        validQuantity,
        create,
    ],
    read: [orderExists, read],
    update: [
        orderExists,
        idMatchRoute,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        dishesIsArray,
        validQuantity,
        validStatus,
        update,
    ],
    destroy: [orderExists, pendingDelete, destroy],
}
