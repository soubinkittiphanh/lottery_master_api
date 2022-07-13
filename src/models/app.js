const express=require("express")
const Router=require("../router/router");
const cors=require("cors");
const sale_master_router=require("../router/router_report")

const buildApp=async(option={})=>{
    const app=express();
    app.use(cors());
    app.use(express.json());
    app.use(sale_master_router.router);
    Router.user(app);
    Router.init(app);
    Router.ism(app);
    Router.group(app);
    Router.branch(app);
    Router.member(app);
    Router.productNeck(app);
    Router.payRate(app);
    Router.report(app);
    Router.sale(app);
    Router.category(app);
    Router.saleMaster(app);
    // Router.validate(app);
    Router.authen(app);
    return app;
}
module.exports=buildApp;