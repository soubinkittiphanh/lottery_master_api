const buildApp = require("./models/app.js");
const conf=require("./config");

autoService=()=>{
  let dateObj = new Date(Date.now()).toLocaleString();
  let day = new Date
  console.log("Worker is runing", dateObj, day.getDay());
}
const startApp = async () => {
  const appOption = {
    logger: true,
  }

  const app = await buildApp(appOption);
  app.listen(conf.port,()=>{
    console.log("Your app is runing  :"+conf.port+' | :'+conf.db.database);
    setInterval(autoService, 3000);
  })

  // try {
  //   // await app.listen(conf.port, conf.host); //this format is not working
  //    app.listen(conf.port, conf.host);
  //   console.log("App is running on port:++ " + conf.port+' | '+conf.db);
  // } catch (error) {
  //   throw error;
  // }
};

startApp();


//curl -H "Content-Type:application/json" --data "{...your data}" http://localhost:3000/login

