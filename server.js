var api = require("./api"),
	express = require("express"),
	app = express();

app.get("/", function(req,res)
{
	res.send("I'm up!");
});


app.get("/art/:artist/:album", function(req,res)
{
	api.getArtistID(req.param("artist"), function (ID)
	{
		api.getAlbumID(ID, req.param("album"), function(data)
		{
			api.getAlbumArt(data, function(url)
			{
				res.send(url);
			});
		})
	});
});

app.use("/resources", express.static("resources"));

app.listen(process.env.PORT||3000);