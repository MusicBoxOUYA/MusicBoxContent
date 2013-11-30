var api = require("./api"),
	express = require("express"),
	app = express(),
	http = require("http");

app.get("/", function(req,res)
{
	res.send("I'm up!");
});


app.get("/artwork", function(req,res)
{
	http.get("http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=0c8d0b702a23553883685199703abe8c&artist=Cher&album=Believe&format=json", function(httpres)
	{
		var data = "";
		httpres.on("data", function(d)
		{
			data += d.toString();
		});
		
		httpres.on("end", function()
		{
			res.json(JSON.parse(data));
		});
	});
});

app.use("/resources", express.static("resources"));

app.listen(process.env.PORT||3000);