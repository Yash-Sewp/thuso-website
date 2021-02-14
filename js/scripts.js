$(document).ready(function () {
	var $status = $('.slider-dots');
	var $slider = $('.partner-slider');

	$slider.on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
		//currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
		var i = (currentSlide ? currentSlide : 0) + 1;
		$status.text(i + '/' + slick.slideCount);
	});

	$slider.slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		infinite: false,
		prevArrow: '<button class="slide-arrow prev-arrow"></button>',
		nextArrow: '<button class="slide-arrow next-arrow"></button>',
		responsive: [
			{
				breakpoint: 480,
				settings: {
					dots: true,
					arrows: false,
				}
			}
		]
	});
})