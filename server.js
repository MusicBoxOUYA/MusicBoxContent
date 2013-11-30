var express = require("express"),
	app = express(),
	http = require("http"),
	memjs = require("memjs"),
	memcached = memjs.Client.create();
	

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});

app.get("/", function(req,res)
{
	res.send("I'm up!");
});


app.get("/artwork", function(req,res)
{
	var artist = req.param("artist");
	var album = req.param("album");
	if ( !artist || !album )
	{
		res.send("Invalid Request");
	}
	else
	{
		memcached.get(album+"-"+artist, function(err, data)
		{
			if ( data && !err )
			{
				res.set("Content-type", "image/png");
				res.end(data.toString(), "binary");
			}
			else
			{
				http.get("http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=0c8d0b702a23553883685199703abe8c&artist="+artist+"&album="+album+"&format=json", function(httpres)
				{
					var data = "";
		
					httpres.on("data", function(d)
					{
						data += d.toString();
					});
					
					httpres.on("end", function()
					{
						try
						{
							var image = '';
							var json = JSON.parse(data);
							var artwork = json.album.image;
							http.get(artwork[artwork.length-2]["#text"], function(artres)
							{
								artres.setEncoding("binary");
								artres.on("data", function(d)
								{
									image += d;
								});
				
								artres.on("end", function()
								{
									memcached.set(album+"-"+artist, image.toString());
									res.set("Content-type", artres.headers["content-type"]);
									res.end(image, "binary");
								});
							});
						} catch (e){ res.send(""); }
			
					});
				});
			}
		});
	}
});

app.use("/resources", express.static("resources"));

app.listen(process.env.PORT||3000);