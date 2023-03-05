import '../sass/style.scss';
import renderItems from './renderItems.js';

const debounce = function(fn, time) {
    let timeout;
    return function() {
        let self = this;
        const functionCall = function() {
            return fn.apply(self, arguments);
        };
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    }
};
$(document).ready(function(){
	let search = '';

	renderItems({
		search,
		firstPage: true
	});

	$('.js-next').click(function(){
		renderItems({
			direction: 'next',
			search
		});
	});

	$('.js-prev').click(function(){
		renderItems({
			direction: 'prev',
			search
		});
	});

	$('.js-search').submit(function(evt) {
		evt.preventDefault();
	});

	$('.js-search [name="search"]').on('input', debounce(function(e) {
		search = $(this).val();
		renderItems({
			search,
			firstPage: true
		});
	}, 300));
});
