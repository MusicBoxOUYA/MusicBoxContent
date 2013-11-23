var parseString = require('xml2js').parseString;
var http = require("http");

var defaultArt = "defaultCoverArt";

function apiRequest(path, callback)
{
	var options = {
		hostname: "musicbrainz.org",
		port: 80,
		path: path,
		method:"GET"
	};
	http.get("http://musicbrainz.org/ws/2/"+path, function(res)
	{
		var content = "";
		res.setEncoding('utf8');
		res.on("data", function(data)
		{
			content += data;
		});
		
		res.on("end", function()
		{
			parseString(content, callback);
		});
	});
}



module.exports.getArtistID = function(artist, callback)
{
	if ( !artist )
		callback(false);
	else
	{
		apiRequest("artist?query="+artist, function(err, data)
		{
			if ( data && data.metadata['artist-list'][0].artist != undefined )
				callback(data.metadata['artist-list'][0].artist[0].$.id);
			else
				callback(false);
		});
	}
};

module.exports.getAlbumID = function(artistID, album, callback)
{
	if ( !artistID || !album )
		callback(false);
	else
	{
		apiRequest("release?artist="+artistID, function(err, data)
		{
			if ( data.metadata != undefined )
			{
				releases = data.metadata['release-list'][0].release;	
				for ( var i = 0; i < releases.length; i++ )
				{
					if ( releases[i].title[0].toLowerCase() == album.toLowerCase() )
					{
						callback(releases[i]['$'].id);
						return;
					}
				}
			}
			else 
				callback(false);
		});
	}
}

module.exports.getAlbumArt = function(albumID, callback)
{
	if ( !albumID )
		callback(defaultArt);
	else
	{
		http.get("http://coverartarchive.org/release/"+albumID+"/front", function(res)
		{	
			res.on("end", function()
			{
				if ( res.headers.location != undefined )
					callback(res.headers.location);
				else
					callback(defaultArt);
			});
		});
	} 
}