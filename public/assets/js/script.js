let idArr = [];
let vidId = '';

//function that captures input from textarea, validates it,
//and then posts it to the server.
function createmovie(movie) {
	let input = movie || $('#movieInput').val().trim();
	input = input.charAt(0).toUpperCase() + input.slice(1);
	let clean = /^[a-zA-Z][a-zA-Z0-9 \-']+$/.test(input);
	if (clean) {
		$('#movieInput').val('');
		let movie = {};
		movie.movie_name = input;
		$.post('/api/movie', movie).then(function (response) {
			location.reload();
		});
	} else {
		$('#movieInput').val('Input may not be empty or contain special characters');
		setTimeout(function () {
			$('#movieInput').val(input);
		}, 1000 * 2);
	}
}

//function that runs ajax call to omdb, and initiates the query to youtube api
function queryMovie(movie) {
	let queryURL = "https://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=d3306ff0";
	getVideo(movie+" movie trailer");
	$.ajax({
		url: queryURL,
		type: 'GET'
	}).done((movieData)=>{
		showMovieModal(movieData);
	});
}


//function that populates the modal when a movie is clicked
function showMovieModal(data) {
	const { Title, Plot, Actors, Ratings } = data,
				title = $('#movieTitle'),
				ratings = $('#movieRatings'),
				actors = $('#movieActors'),
				plot = $('#moviePlot');
	title.text('');
	ratings.text('');
	actors.text('');
	plot.text('');
	if (data) {
		$('#movieModal').show();
	}
	if (data.Error) {
		title.text('No information for this movie');
		ratings.hide().val('');
		actors.hide().val('');
		plot.hide().val('');
		return;
	} 
		Ratings.forEach((item, i) => {
			let li = $('<li class="rating">')
								.text(`${item.Source}: ${item.Value}`)
								.appendTo('#movieRatings');
			i !== Ratings.length - 1 && ratings.append('<li>|</li>');
		});
		ratings.show();
		title.text(Title);
		actors.show().text(`Starring: ${Actors}`);
		plot.show().text(Plot);
}


//function that runs once the youtube script tag loads
function init() {
	gapi.client.setApiKey('AIzaSyBlwnFUqu7sXdnRvYhnrEDn7ZMgOulZW2k');
	gapi.client.load('youtube', 'v3', function () {
		console.log('Youtube is ready for queries...');
		//click event for running query on movie title, and populating the modal
		$(document).on('click', '.movieName', function (event) {
			event.preventDefault();
			let movie = $(this).data('moviename');
			queryMovie(movie);
			console.log('Query sent');
		});
	});
}


//function that queries the youtube database to get the video id's for trailers
function getVideo(movie) {
	idArr = [];
	let request = gapi.client.youtube.search.list({
		part: 'snippet',
		type: 'video',
		q: encodeURIComponent(movie).replace(/%20/g, '+'),
		maxResults: 20,
		order: 'relevance'
	});

	request.execute(function (result) {
		if (result) {
			for (var i = 0; i < result.items.length; i++) {
				idArr.push(result.items[i].id.videoId);
			}
			vidId = idArr[0];
			let url = `https://www.youtube.com/embed/${idArr[0]}`;
			$('#trailer').attr('src', url);
		}
	});
}

//function that cycles through the youtube videos to find the right trailer
function showNextTrailer() {
	const index = idArr.indexOf(vidId),
				url = `https://www.youtube.com/embed/${vidId}`;
	vidId = idArr[index+1];
	$('#trailer').attr('src', url);
}
//initializing annyang speech-to-text functionality
if (annyang) {

	// property defines command, passes
	//anything said after 'add' as an argument to
	//createmovie function and calls it.
	const commands = {
		'add *movie': createmovie
	};

	// Add our commands to annyang
	annyang.addCommands(commands);

	// Start listening.
	annyang.start();
} else {
	$('<h4>').addClass('warning text-center')
		.text('Your browser doesn\'t support speech recognition')
		.prependTo('#movieForm');
}


//event listener for submit button
$('#submit').on('click', function (event) {
	event.preventDefault();
	createmovie();
});


//event listener for enter key
$('#movieInput').keydown(function (e) {
	let key = e.which;
	if(key === 13) {
		createmovie();
	}
});


//event listener for watch buttons to execute put request
$(document).on('click', '.watch', function (event) {
	event.preventDefault();
	let id = $(this).attr('id');
	$.ajax('/api/'+id, {
		type: 'PUT'
	}).then(function () {
		location.reload();
	});
});

//click event for closing the modal
$('.close').on('click', function (event) {
	event.preventDefault();
	$('#movieModal').hide();
});

//click event for button that cycles through different youtube videos
$('#nextButton').on('click', function (event) {
	event.preventDefault();
	showNextTrailer();
});

$('#login').on('click', function (event) {
	event.preventDefault();
	let user = {};
	user.userName = $('#userName').val().trim();
	user.password = $('#password').val().trim();
	$.ajax('/login', {
		type: 'POST',
		data: user
	}).done((response)=>{
	});
});

$('#create').on('click', function (event) {
	event.preventDefault();
	let user = {};
	user.userName = $('#create-userName').val().trim();
	user.password = $('#create-password').val().trim();
	$.ajax('/api/create', {
		type: 'POST',
		data: user
	}).done((response)=>{
	});
});
