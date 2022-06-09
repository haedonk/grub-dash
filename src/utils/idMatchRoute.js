function idMatchRoute(req, res, next){
    let dish = false;
    const routeId = req.params.dishId ? req.params.dishId : req.params.orderId;
    if(req.body.data.id){
        const bodyId = req.body.data.id;
        if(bodyId === routeId){
            return next();
        }
        if(req.params.dishId){
            return next({status: 400, message: `Dish id does not match route id. Dish: ${bodyId}, Route: ${routeId}`});
        }
        return next({status: 400, message: `Order id does not match route id. Order: ${bodyId}, Route: ${routeId}`});
    }
    next();
}

module.exports = idMatchRoute;