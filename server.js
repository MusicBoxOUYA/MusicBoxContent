var express = require("express"),
	app = express(),
	http = require("http");

app.get("/", function(req,res)
{
	res.send("I'm up!");
});

app.use("/resources", express.static("resources"));

app.listen(process.env.PORT||3000);