var images = require('images');
images('img.jpg').draw(images('loading.png'),20,20).save('dd.jpg',{
	quality: 100
})